import type { EmailProvider } from "../models/ConnectedEmailAccount";

export interface ProviderAuthorizationIdentity {
  provider: EmailProvider;
  providerAccountId: string;
  emailAddress: string;
  displayName?: string;
}

export interface ProviderTokenSet {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  grantedScopes: string[];
  identity: ProviderAuthorizationIdentity;
}

export interface EmailConnectionProvider {
  readonly provider: EmailProvider;
  createAuthorizationUrl(input: { state: string; codeChallenge: string }): URL;
  exchangeAuthorizationCode(input: { code: string; codeVerifier: string }): Promise<ProviderTokenSet>;
  revoke(token: string): Promise<void>;
}
