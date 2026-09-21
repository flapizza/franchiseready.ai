import type { HistoricalAssessment } from "./HistoricalAssessmentDocuments";

/** Presentation only: retain submitted evidence and analysis exactly as stored. */
export function demoAssessmentPresentation(
  organizationId: string,
  candidateId: string,
  record: HistoricalAssessment,
): HistoricalAssessment {
  if (organizationId !== "e117c597-0966-43ee-a128-a43dd979504e"
    || candidateId !== "cand_14e86a7e44ac48ab9da158beaf2081f8"
    || record.sessionId !== "8cfdc99f-abcf-4a82-8a25-4e860c46e7fb"
    || record.submissionId !== "79650038-1907-4e1c-a642-018c7d27c62b") return record;

  return {
    ...record,
    intake: {
      ...record.intake,
      firstName: "Benjamin",
      preferredName: "",
      lastName: "Carter",
      email: "benjamin.carter@frangroove-demo.example",
      occupationTitle: "Operations Manager",
      streetAddress: "184 Lakeview Terrace",
    },
  };
}
