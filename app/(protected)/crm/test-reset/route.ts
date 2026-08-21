import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";

export async function POST() {
  if (!isConferenceDemoAccessEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const user = await getConferenceDemoUser();
  if (!user) return new NextResponse("Forbidden", { status: 403 });
  demoCandidateOverlayStore.reset();
  revalidatePath("/crm");
  revalidatePath("/crm/candidates");
  revalidatePath("/crm/tasks");
  revalidatePath("/crm/communications");
  revalidatePath("/settings/pipeline");
  return NextResponse.json({ status: "reset" });
}
