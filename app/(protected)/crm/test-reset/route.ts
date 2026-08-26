import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";

export async function POST() {
  if (!isConferenceDemoAccessEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getConferenceDemoUser();
  if (!user) return new NextResponse("Forbidden", { status: 403 });
  demoCandidateOverlayStore.reset();
  conferenceAssessmentStore.clear();
  revalidatePath("/crm");
  revalidatePath("/crm/candidates");
  revalidatePath("/crm/candidates/[candidateId]", "page");
  revalidatePath("/crm/candidates/[candidateId]/strategy", "page");
  revalidatePath("/crm/candidates/[candidateId]/strategy/presentation", "page");
  revalidatePath("/crm/candidates/[candidateId]/referral", "page");
  revalidatePath("/crm/tasks");
  revalidatePath("/crm/communications");
  revalidatePath("/crm/candidates/[candidateId]/playbook", "page");
  revalidatePath("/settings/pipeline");
  return NextResponse.json({ status: "reset" });
}
