import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { sha256, validateOAuthTransaction } from "@/feature/connected-email/oauth/oauth-security";

const COOKIE = "frangroove_google_pkce";
const resultUrl = (request: Request, result: string) => {
  const url = new URL("/settings/email", request.url); url.searchParams.set("google", result); return url;
};

export async function GET(request: Request) {
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved"||"runtimes" in resolution.composition)return NextResponse.redirect(resultUrl(request,"session-required"));const context=resolution.composition.dependencies.workspaceContext;
  const params = new URL(request.url).searchParams;
  const state = params.get("state");
  if (!state) return NextResponse.redirect(resultUrl(request, "invalid-state"));
  const transaction = await resolution.composition.dependencies.oauthTransactions.consume(context, await sha256(state));
  const cookieStore = await cookies();
  const verifier = cookieStore.get(COOKIE)?.value;
  cookieStore.delete(COOKIE);
  if (!transaction || !verifier) return NextResponse.redirect(resultUrl(request, "invalid-state"));
  const verifierHash = await sha256(verifier);
  if (!validateOAuthTransaction({ transaction, provider: "google", organizationId: context.organization.id,
    membershipId: context.membership.id, userId: context.user.id, verifierHash })) {
    return NextResponse.redirect(resultUrl(request, "invalid-state"));
  }
  if (params.get("error") === "access_denied") return NextResponse.redirect(resultUrl(request, "denied"));
  const code = params.get("code");
  if (!code || params.has("error")) return NextResponse.redirect(resultUrl(request, "failed"));
  try {
    await resolution.composition.dependencies.googleConnections.complete(context, { code, codeVerifier: verifier });
    return NextResponse.redirect(new URL(transaction.return_path, request.url));
  } catch {
    return NextResponse.redirect(resultUrl(request, "failed"));
  }
}
