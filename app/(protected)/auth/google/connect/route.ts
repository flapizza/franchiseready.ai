import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { createOAuthState, createPkceChallenge, createPkceVerifier, isSafeEmailSettingsReturnPath, sha256 } from "@/feature/connected-email/oauth/oauth-security";
import { isSameOriginRequest } from "@/feature/connected-email/oauth/request-security";

const COOKIE = "frangroove_google_pkce";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Forbidden", { status: 403 });
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved"||"runtimes" in resolution.composition)return new NextResponse("Unauthorized",{status:401});const context=resolution.composition.dependencies.workspaceContext;
  const form = await request.formData();
  const requestedReturn = String(form.get("returnTo") ?? "");
  const returnPath = isSafeEmailSettingsReturnPath(requestedReturn) ? requestedReturn : "/settings/email";
  const state = createOAuthState();
  const verifier = createPkceVerifier();
  await resolution.composition.dependencies.oauthTransactions.create(context, { stateHash: await sha256(state), verifierHash: await sha256(verifier),
    returnPath, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
  (await cookies()).set(COOKIE, verifier, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/auth/google/callback", maxAge: 5 * 60 });
  const authorizationUrl = resolution.composition.dependencies.googleProvider.createAuthorizationUrl({ state, codeChallenge: await createPkceChallenge(verifier) });
  return NextResponse.redirect(authorizationUrl, 303);
}
