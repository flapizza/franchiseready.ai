import "server-only";
import { getGoogleOAuthEnvironment } from "@/lib/env";
import type { EmailConnectionProvider, ProviderTokenSet } from "../EmailConnectionProvider";
import { normalizeGoogleIdentity } from "./google-identity";

export const GOOGLE_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_CONNECTION_SCOPES = Object.freeze(["openid", "email", "profile", GOOGLE_SEND_SCOPE] as const);
export const FORBIDDEN_GMAIL_SCOPES = Object.freeze([
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://mail.google.com/",
] as const);

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

type GoogleUserInfo = { sub?: string; email?: string; email_verified?: boolean; name?: string };

export class GoogleConnectionProvider implements EmailConnectionProvider {
  readonly provider = "google" as const;

  createAuthorizationUrl(input: { state: string; codeChallenge: string }): URL {
    const environment = getGoogleOAuthEnvironment();
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: environment.GOOGLE_CLIENT_ID,
      redirect_uri: environment.GOOGLE_OAUTH_REDIRECT_URI,
      response_type: "code",
      scope: GOOGLE_CONNECTION_SCOPES.join(" "),
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent",
      state: input.state,
      code_challenge: input.codeChallenge,
      code_challenge_method: "S256",
    }).toString();
    return url;
  }

  async exchangeAuthorizationCode(input: { code: string; codeVerifier: string }): Promise<ProviderTokenSet> {
    const environment = getGoogleOAuthEnvironment();
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: input.code,
        client_id: environment.GOOGLE_CLIENT_ID,
        client_secret: environment.GOOGLE_CLIENT_SECRET,
        redirect_uri: environment.GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: input.codeVerifier,
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Google authorization could not be completed.");
    const tokens = await response.json() as GoogleTokenResponse;
    if (!tokens.access_token) throw new Error("Google did not return an access token.");

    const identityResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!identityResponse.ok) throw new Error("Google account identity could not be verified.");
    const identity = await identityResponse.json() as GoogleUserInfo;
    const normalizedIdentity = normalizeGoogleIdentity(identity);
    const grantedScopes = [...new Set((tokens.scope ?? "").split(/\s+/).filter(Boolean))].sort();
    if (!grantedScopes.includes(GOOGLE_SEND_SCOPE)) {
      throw new Error("Google account authorization is missing a required capability.");
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : undefined,
      grantedScopes,
      identity: normalizedIdentity,
    };
  }

  async revoke(token: string): Promise<void> {
    const response = await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
    if (!response.ok && response.status !== 400) throw new Error("Google authorization could not be revoked.");
  }
}
