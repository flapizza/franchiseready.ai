import { notFound } from "next/navigation";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { ConferenceAssessmentExperience } from "@/feature/assessment-engine/conference/components/ConferenceAssessmentExperience";

export default function ConferenceAssessmentPage() {
  if (!isConferenceDemoAccessEnabled()) notFound();
  return <ConferenceAssessmentExperience />;
}
