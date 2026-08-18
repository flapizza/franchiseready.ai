import { NextResponse } from "next/server";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";

export async function POST(request: Request) {
  if (!isConferenceDemoAccessEnabled()) return new NextResponse("Not found", { status: 404 });
  if (!(await getConferenceDemoUser())) return new NextResponse("Forbidden", { status: 403 });
  const body = await request.json() as { referralId?: unknown };
  if (typeof body.referralId !== "string" || !body.referralId) return new NextResponse("Referral ID is required", { status: 400 });
  demoCandidateOverlayStore.failNextReferralDelivery(body.referralId);
  return NextResponse.json({ status: "configured" });
}
