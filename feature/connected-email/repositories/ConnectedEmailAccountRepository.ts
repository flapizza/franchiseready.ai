import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { ConnectedEmailAccount, ConnectedEmailAccountSummary } from "../models/ConnectedEmailAccount";
import type { LooseSupabaseClient } from "./supabase-query";

type AccountRow = {
  id: string; public_id: string; organization_id: string; owner_membership_id: string; provider: "google" | "microsoft";
  provider_account_id: string; email_address: string; display_name: string | null; status: ConnectedEmailAccount["status"];
  granted_scopes: string[]; connected_at: string | null; last_token_refresh_at: string | null; disconnected_at: string | null;
};

export function normalizeConnectedAccount(row: AccountRow): ConnectedEmailAccount {
  return { id: row.id, publicId: row.public_id, organizationId: row.organization_id, ownerMembershipId: row.owner_membership_id,
    provider: row.provider, providerAccountId: row.provider_account_id, emailAddress: row.email_address, displayName: row.display_name ?? undefined,
    status: row.status, grantedScopes: row.granted_scopes, connectedAt: row.connected_at ?? undefined,
    lastTokenRefreshAt: row.last_token_refresh_at ?? undefined, disconnectedAt: row.disconnected_at ?? undefined };
}

export class ConnectedEmailAccountRepository {
  async listOwn(context: AuthenticatedWorkspaceContext): Promise<ConnectedEmailAccount[]> {
    const client = await createServerSupabaseClient() as unknown as LooseSupabaseClient;
    const { data, error } = await client.from("connected_email_accounts").select("*")
      .eq("organization_id", context.organization.id).eq("owner_membership_id", context.membership.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Connected email accounts could not be loaded.");
    return (data as AccountRow[]).map(normalizeConnectedAccount);
  }

  async getOwn(context: AuthenticatedWorkspaceContext, publicId: string): Promise<ConnectedEmailAccount | null> {
    const client = await createServerSupabaseClient() as unknown as LooseSupabaseClient;
    const { data, error } = await client.from("connected_email_accounts").select("*").eq("public_id", publicId)
      .eq("organization_id", context.organization.id).eq("owner_membership_id", context.membership.id).maybeSingle();
    if (error) throw new Error("Connected email account could not be loaded.");
    return data ? normalizeConnectedAccount(data as AccountRow) : null;
  }

  static toSummary(account: ConnectedEmailAccount): ConnectedEmailAccountSummary {
    return { publicId: account.publicId, provider: account.provider, emailAddress: account.emailAddress,
      displayName: account.displayName, status: account.status,
      capabilities: account.grantedScopes.includes(GMAIL_SEND) ? ["Send email from FranGroove"] : [], connectedAt: account.connectedAt };
  }
}

const GMAIL_SEND = "https://www.googleapis.com/auth/gmail.send";
