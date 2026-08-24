import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ProviderTokenSet } from "../providers/EmailConnectionProvider";
import type { CredentialCipher } from "../security/CredentialCipher";
import { LocalAesGcmCredentialCipher } from "../security/LocalAesGcmCredentialCipher";
import { normalizeConnectedAccount } from "../repositories/ConnectedEmailAccountRepository";
import type { ConnectedEmailAccount } from "../models/ConnectedEmailAccount";
import type { LooseSupabaseClient } from "../repositories/supabase-query";
import { getGoogleOAuthEnvironment } from "@/lib/env";

export type StoredTokens = { accessToken: string; refreshToken: string; accessTokenExpiresAt?: string };
type CredentialRow = { cipher_provider: string; cipher_version: number; encrypted_payload: string };
type AdminAccountRow = Parameters<typeof normalizeConnectedAccount>[0];

export class ConnectedAccountOwnershipError extends Error {}
export class MissingRefreshTokenError extends Error {}
export class GoogleReconnectRequiredError extends Error {}

export class ConnectedEmailCredentialService {
  constructor(private readonly cipher: CredentialCipher = new LocalAesGcmCredentialCipher()) {}

  private client(): LooseSupabaseClient {
    return createAdminSupabaseClient() as unknown as LooseSupabaseClient;
  }

  private async verifyOwner(context: AuthenticatedWorkspaceContext): Promise<void> {
    const { data, error } = await this.client().from("organization_memberships").select("id").eq("id", context.membership.id)
      .eq("organization_id", context.organization.id).eq("user_id", context.user.id).eq("status", "active").maybeSingle();
    if (error || !data) throw new ConnectedAccountOwnershipError("Active mailbox ownership could not be verified.");
  }

  async connect(context: AuthenticatedWorkspaceContext, tokenSet: ProviderTokenSet): Promise<ConnectedEmailAccount> {
    await this.verifyOwner(context);
    const client = this.client();
    const { data: existing, error: lookupError } = await client.from("connected_email_accounts").select("*")
      .eq("organization_id", context.organization.id).eq("provider", tokenSet.identity.provider)
      .eq("provider_account_id", tokenSet.identity.providerAccountId).maybeSingle();
    if (lookupError) throw new Error("Connected Google account could not be checked.");
    const existingAccount = existing as AdminAccountRow | null;
    if (existingAccount && existingAccount.owner_membership_id !== context.membership.id) {
      throw new ConnectedAccountOwnershipError("This Google account is already connected by another consultant in this workspace.");
    }

    let refreshToken = tokenSet.refreshToken;
    if (!refreshToken && existingAccount) {
      const previous = await this.readTokens(existingAccount.id);
      refreshToken = previous?.refreshToken;
    }
    if (!refreshToken) throw new MissingRefreshTokenError("Google did not provide offline access. Reconnect and approve consent.");

    const now = new Date().toISOString();
    let account = existingAccount;
    if (account) {
      const { data, error } = await client.from("connected_email_accounts").update({ email_address: tokenSet.identity.emailAddress,
        display_name: tokenSet.identity.displayName ?? null, status: "connected", granted_scopes: tokenSet.grantedScopes,
        connected_at: now, disconnected_at: null, last_token_refresh_at: now }).eq("id", account.id).select("*").single();
      if (error) throw new Error("Connected Google account could not be updated.");
      account = data as AdminAccountRow;
    } else {
      const { data, error } = await client.from("connected_email_accounts").insert({ organization_id: context.organization.id,
        owner_membership_id: context.membership.id, provider: tokenSet.identity.provider,
        provider_account_id: tokenSet.identity.providerAccountId, email_address: tokenSet.identity.emailAddress,
        display_name: tokenSet.identity.displayName ?? null, status: "connected", granted_scopes: tokenSet.grantedScopes,
        connected_at: now, last_token_refresh_at: now }).select("*").single();
      if (error) throw new Error("Connected Google account could not be saved.");
      account = data as AdminAccountRow;
    }

    const stored: StoredTokens = { accessToken: tokenSet.accessToken, refreshToken, accessTokenExpiresAt: tokenSet.accessTokenExpiresAt };
    const encryptedPayload = await this.cipher.encrypt(account.id, JSON.stringify(stored));
    const { error: credentialError } = await client.from("connected_email_credentials").upsert({ connected_email_account_id: account.id,
      cipher_provider: this.cipher.providerName, cipher_version: this.cipher.version, encrypted_payload: encryptedPayload,
      access_token_expires_at: tokenSet.accessTokenExpiresAt ?? null });
    if (credentialError) throw new Error("Google credentials could not be stored securely.");
    return normalizeConnectedAccount(account);
  }

  async readTokens(accountId: string): Promise<StoredTokens | null> {
    const { data, error } = await this.client().from("connected_email_credentials").select("*")
      .eq("connected_email_account_id", accountId).maybeSingle();
    if (error) throw new Error("Stored Google credentials could not be loaded.");
    if (!data) return null;
    const credential = data as CredentialRow;
    if (credential.cipher_provider !== this.cipher.providerName || credential.cipher_version !== this.cipher.version) {
      throw new Error("Stored Google credential encryption is unsupported.");
    }
    return JSON.parse(await this.cipher.decrypt(accountId, credential.encrypted_payload)) as StoredTokens;
  }

  async getGoogleAccessToken(context: AuthenticatedWorkspaceContext, account: ConnectedEmailAccount): Promise<string> {
    if (account.organizationId !== context.organization.id || account.ownerMembershipId !== context.membership.id ||
      account.provider !== "google" || account.status !== "connected" ||
      !account.grantedScopes.includes("https://www.googleapis.com/auth/gmail.send")) {
      throw new ConnectedAccountOwnershipError("A usable owned Google account is required.");
    }
    await this.verifyOwner(context);
    const tokens = await this.readTokens(account.id);
    if (!tokens?.refreshToken) throw new GoogleReconnectRequiredError("Google authorization is unavailable. Reconnect the account.");
    const expiresAt = tokens.accessTokenExpiresAt ? Date.parse(tokens.accessTokenExpiresAt) : 0;
    if (tokens.accessToken && expiresAt > Date.now() + 60_000) return tokens.accessToken;

    const environment = getGoogleOAuthEnvironment();
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: environment.GOOGLE_CLIENT_ID, client_secret: environment.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refreshToken, grant_type: "refresh_token" }) });
    const payload = await response.json().catch(() => ({})) as { access_token?: string; expires_in?: number; error?: string };
    if (!response.ok || !payload.access_token) {
      if (payload.error === "invalid_grant") {
        await this.client().from("connected_email_accounts").update({ status: "action-required" }).eq("id", account.id);
      }
      throw new GoogleReconnectRequiredError("Google authorization could not be refreshed. Reconnect the account.");
    }
    const accessTokenExpiresAt = new Date(Date.now() + Math.max(60, payload.expires_in ?? 3600) * 1000).toISOString();
    const encryptedPayload = await this.cipher.encrypt(account.id, JSON.stringify({ accessToken: payload.access_token,
      refreshToken: tokens.refreshToken, accessTokenExpiresAt } satisfies StoredTokens));
    const client = this.client();
    const { error } = await client.from("connected_email_credentials").update({ encrypted_payload: encryptedPayload,
      access_token_expires_at: accessTokenExpiresAt }).eq("connected_email_account_id", account.id);
    if (error) throw new Error("Refreshed Google credentials could not be stored securely.");
    await client.from("connected_email_accounts").update({ last_token_refresh_at: new Date().toISOString(), status: "connected" }).eq("id", account.id);
    return payload.access_token;
  }

  async destroy(accountId: string): Promise<void> {
    const { error } = await this.client().from("connected_email_credentials").delete().eq("connected_email_account_id", accountId);
    if (error) throw new Error("Stored Google credentials could not be invalidated.");
  }
}
