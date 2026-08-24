import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";
import { GoogleConnectionProvider } from "@/feature/connected-email/providers/google/GoogleConnectionProvider";
import { OAuthTransactionRepository } from "@/feature/connected-email/repositories/OAuthTransactionRepository";
import { createOAuthState, createPkceChallenge, createPkceVerifier, isSafeEmailSettingsReturnPath, sha256 } from "@/feature/connected-email/oauth/oauth-security";
import { isSameOriginRequest } from "@/feature/connected-email/oauth/request-security";

const COOKIE = "frangroove_google_pkce";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Forbidden", { status: 403 });
  const context = await resolveAuthenticatedWorkspaceContext();
  if (!context) return new NextResponse("Unauthorized", { status: 401 });
  const form = await request.formData();
  const requestedReturn = String(form.get("returnTo") ?? "");
  const returnPath = isSafeEmailSettingsReturnPath(requestedReturn) ? requestedReturn : "/settings/email";
  const state = createOAuthState();
  const verifier = createPkceVerifier();
  await new OAuthTransactionRepository().create(context, { stateHash: await sha256(state), verifierHash: await sha256(verifier),
    returnPath, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
  (await cookies()).set(COOKIE, verifier, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/auth/google/callback", maxAge: 5 * 60 });
  const authorizationUrl = new GoogleConnectionProvider().createAuthorizationUrl({ state, codeChallenge: await createPkceChallenge(verifier) });
  return NextResponse.redirect(authorizationUrl, 303);
}
