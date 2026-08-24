export type EmailProvider = "google" | "microsoft";
export type ConnectedEmailAccountStatus = "pending" | "connected" | "action-required" | "revoked" | "disconnected";

export interface ConnectedEmailAccount {
  id: string;
  publicId: string;
  organizationId: string;
  ownerMembershipId: string;
  provider: EmailProvider;
  providerAccountId: string;
  emailAddress: string;
  displayName?: string;
  status: ConnectedEmailAccountStatus;
  grantedScopes: string[];
  connectedAt?: string;
  lastTokenRefreshAt?: string;
  disconnectedAt?: string;
}

export interface ConnectedEmailAccountSummary {
  publicId: string;
  provider: EmailProvider;
  emailAddress: string;
  displayName?: string;
  status: ConnectedEmailAccountStatus;
  capabilities: string[];
  connectedAt?: string;
}
