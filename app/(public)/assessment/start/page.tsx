import { notFound } from "next/navigation";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { ConferenceAssessmentExperience } from "@/feature/assessment-engine/conference/components/ConferenceAssessmentExperience";

export default async function ConferenceAssessmentPage({ searchParams }: { searchParams: Promise<{ invitation?: string }> }) {
  if (!isConferenceDemoAccessEnabled()) notFound();
  const { invitation } = await searchParams;
  return <ConferenceAssessmentExperience demoInvitationToken={invitation} />;
}
