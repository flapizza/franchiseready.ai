const encoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

export async function sha256(value: string): Promise<string> {
  return Buffer.from(await crypto.subtle.digest("SHA-256", encoder.encode(value))).toString("hex");
}

export function createOAuthState(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export function createPkceVerifier(): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(64)));
}

export async function createPkceChallenge(verifier: string): Promise<string> {
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))));
}

export function isSafeEmailSettingsReturnPath(value: string | null): value is string {
  return Boolean(value && /^\/settings\/email(?:[/?#].*)?$/.test(value));
}

export function validateOAuthTransaction(input: {
  transaction: { provider: string; organization_id: string; owner_membership_id: string; user_id: string; expires_at: string; pkce_verifier_hash: string } | null;
  provider: string;
  organizationId: string;
  membershipId: string;
  userId: string;
  verifierHash?: string;
  now?: number;
}): boolean {
  const transaction = input.transaction;
  return Boolean(transaction && input.verifierHash
    && transaction.provider === input.provider
    && transaction.organization_id === input.organizationId
    && transaction.owner_membership_id === input.membershipId
    && transaction.user_id === input.userId
    && Date.parse(transaction.expires_at) > (input.now ?? Date.now())
    && transaction.pkce_verifier_hash === input.verifierHash);
}
