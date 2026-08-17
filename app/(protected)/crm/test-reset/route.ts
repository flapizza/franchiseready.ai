import { NextResponse } from "next/server";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";

export async function POST() {
  if (process.env.NODE_ENV !== "development" || !isConferenceDemoAccessEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getConferenceDemoUser();
  if (!user) return new NextResponse("Forbidden", { status: 403 });
  demoCandidateOverlayStore.reset();
  return NextResponse.json({ status: "reset" });
}
