import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ProviderTokenSet } from "../providers/EmailConnectionProvider";
import type { CredentialCipher } from "../security/CredentialCipher";
import { LocalAesGcmCredentialCipher } from "../security/LocalAesGcmCredentialCipher";
import { normalizeConnectedAccount } from "../repositories/ConnectedEmailAccountRepository";
import type { ConnectedEmailAccount } from "../models/ConnectedEmailAccount";
import type { LooseSupabaseClient } from "../repositories/supabase-query";

type StoredTokens = { accessToken: string; refreshToken: string; accessTokenExpiresAt?: string };
type CredentialRow = { cipher_provider: string; cipher_version: number; encrypted_payload: string };
type AdminAccountRow = Parameters<typeof normalizeConnectedAccount>[0];

export class ConnectedAccountOwnershipError extends Error {}
export class MissingRefreshTokenError extends Error {}

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

  async destroy(accountId: string): Promise<void> {
    const { error } = await this.client().from("connected_email_credentials").delete().eq("connected_email_account_id", accountId);
    if (error) throw new Error("Stored Google credentials could not be invalidated.");
  }
}
