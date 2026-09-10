import { conferenceQuestions } from "@/feature/assessment-engine/conference/questions";
import type { ConferenceAnalysis, ConferenceAnswers, ConferenceIntake } from "@/feature/assessment-engine/conference/types";
import { AssessmentReportService } from "./AssessmentReportService";

export interface HistoricalAssessment {
  id: string; sessionId: string; submissionId: string; instrumentVersion: string;
  completedAt: string; generatedAt: string; analysis: ConferenceAnalysis;
  intake: ConferenceIntake; answers: ConferenceAnswers;
}
export type DocumentKind = "assessment" | "profile" | "consultant";
export function historicalReport(record: HistoricalAssessment, kind: DocumentKind) {
  const source = { analysis: record.analysis, completedAt: record.completedAt, candidateName: `${record.intake.firstName} ${record.intake.lastName}`, instrumentVersion: record.instrumentVersion };
  const service = new AssessmentReportService();
  const report = kind === "consultant" ? service.buildConsultantReport(source) : service.buildCandidateReport(source);
  if (kind === "assessment") {
    report.title = "Completed Assessment";
    report.reportType="COMPLETED_ASSESSMENT";report.templateVersion="completed-assessment-v1";report.audience="consultant";
    report.subtitle = "The candidate’s submitted responses";
    report.privacyClassification = "INTERNAL CONSULTANT USE";
    const questions=[...conferenceQuestions.filter(q=>q.kind!=="context"),
      {id:"q36-geography",prompt:"What best describes your geographic flexibility?"},
      {id:"q36-stakeholders",prompt:"Who else is likely to be involved in this decision?"},
      {id:"q36-stage",prompt:"Where are you in your ownership exploration?"},
      {id:"concerns",prompt:"What concerns you most about business ownership?"},
      {id:"primary-concern",prompt:"Which concern is primary?"},
    ];
    report.sections = questions.map(q => ({ heading: q.prompt, paragraphs: record.answers[q.id]?.length ? record.answers[q.id] : ["No response submitted."] }));
    report.disclaimer = "Historical candidate-provided responses. Financial and other statements have not been independently verified.";
  }
  report.sections.unshift({ heading: "Historical assessment record", paragraphs: [
    `Submission: ${record.submissionId}. Analysis: ${record.id}, generated ${record.generatedAt}. Instrument: ${record.instrumentVersion}.`,
    "This document represents this completed assessment and analysis version. Subsequent Discovery and consultant refinements belong to Current Candidate Intelligence and do not rewrite this record.",
  ] });
  return report;
}
