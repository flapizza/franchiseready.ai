import type { ConferenceAnalysis } from "@/feature/assessment-engine/conference/types";

export type AssessmentReportType = "CANDIDATE_ASSESSMENT_REPORT" | "CONSULTANT_INTELLIGENCE_REPORT";
export type ReportAudience = "candidate" | "consultant";
export type ReportSection = { heading: string; paragraphs?: string[]; bullets?: string[] };

export type AssessmentReport = {
  reportType: AssessmentReportType;
  audience: ReportAudience;
  privacyClassification: "CANDIDATE SAFE" | "INTERNAL CONSULTANT USE";
  templateVersion: "candidate-report-v1" | "consultant-report-v1";
  candidateName?: string;
  instrumentLabel: "Franchise Ownership Assessment v1.0";
  instrumentVersion: string;
  analysisVersion: number;
  assessmentCompletedAt: string;
  generatedAt: string;
  title: string;
  subtitle: string;
  sections: ReportSection[];
  disclaimer: string;
  source: ConferenceAnalysis;
};
