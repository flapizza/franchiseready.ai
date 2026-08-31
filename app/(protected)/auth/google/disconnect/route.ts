import { NextResponse } from "next/server";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { isSameOriginRequest } from "@/feature/connected-email/oauth/request-security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Forbidden", { status: 403 });
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved"||"runtimes" in resolution.composition)return new NextResponse("Unauthorized",{status:401});const context=resolution.composition.dependencies.workspaceContext;
  const form = await request.formData();
  const accountId = String(form.get("accountId") ?? "");
  try {
    await resolution.composition.dependencies.googleConnections.disconnect(context, accountId);
    return NextResponse.redirect(new URL("/settings/email?google=disconnected", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/settings/email?google=disconnect-failed", request.url), 303);
  }
}
