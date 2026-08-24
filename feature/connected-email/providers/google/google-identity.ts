import type { ProviderAuthorizationIdentity } from "../EmailConnectionProvider";

export function normalizeGoogleIdentity(input: { sub?: string; email?: string; email_verified?: boolean; name?: string }): ProviderAuthorizationIdentity {
  const providerAccountId = input.sub?.trim();
  const emailAddress = input.email?.trim().toLowerCase();
  if (!providerAccountId || !emailAddress || input.email_verified !== true) {
    throw new Error("Google returned an incomplete or unverified account identity.");
  }
  return { provider: "google", providerAccountId, emailAddress, displayName: input.name?.trim() || undefined };
}
