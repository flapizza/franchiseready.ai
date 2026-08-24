import { NextResponse } from "next/server";
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";
import { GoogleConnectionService } from "@/feature/connected-email/services/GoogleConnectionService";
import { isSameOriginRequest } from "@/feature/connected-email/oauth/request-security";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return new NextResponse("Forbidden", { status: 403 });
  const context = await resolveAuthenticatedWorkspaceContext();
  if (!context) return new NextResponse("Unauthorized", { status: 401 });
  const form = await request.formData();
  const accountId = String(form.get("accountId") ?? "");
  try {
    await new GoogleConnectionService().disconnect(context, accountId);
    return NextResponse.redirect(new URL("/settings/email?google=disconnected", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/settings/email?google=disconnect-failed", request.url), 303);
  }
}
