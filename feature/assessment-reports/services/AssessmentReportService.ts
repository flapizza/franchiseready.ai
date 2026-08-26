import type { ConferenceAnalysis } from "@/feature/assessment-engine/conference/types";
import type { AssessmentReport } from "../models/AssessmentReport";

type Source = { analysis: ConferenceAnalysis; completedAt: string; candidateName?: string; instrumentVersion?: string; generatedAt?: string };
const values = (items: string[]) => items.length ? items : ["Explore during Discovery."];
const characteristicLabel=(value:string)=>value.split(/[- ]+/).map(word=>word.toUpperCase()==="B2B"?"B2B":word.charAt(0).toUpperCase()+word.slice(1)).join(" ");

export class AssessmentReportService {
  buildCandidateReport(source: Source): AssessmentReport {
    const { analysis } = source;
    const profile = analysis.ownershipProfile;
    return {
      reportType: "CANDIDATE_ASSESSMENT_REPORT", audience: "candidate", privacyClassification: "CANDIDATE SAFE",
      templateVersion: "candidate-report-v1", candidateName: source.candidateName,
      instrumentLabel: "Franchise Ownership Assessment v1.0", instrumentVersion: source.instrumentVersion ?? analysis.instrumentVersion,
      analysisVersion: analysis.analysisVersion, assessmentCompletedAt: source.completedAt, generatedAt: source.generatedAt ?? new Date().toISOString(),
      title: "Franchise Ownership Profile", subtitle: profile.primary, source: analysis,
      sections: [
        { heading: "Your Ownership Profile", paragraphs: [profile.interpretation, `Confidence: ${profile.confidenceState}. Supporting characteristics: ${profile.supporting.join(", ") || "Explore during Discovery"}.`] },
        { heading: "What Motivates You", bullets: values(profile.motivations) },
        { heading: "How You Prefer to Operate", bullets: values(profile.operatingPreferences) },
        { heading: "Ownership Strengths", bullets: values(profile.strengths) },
        { heading: "Business Characteristics Worth Exploring", bullets: values(profile.characteristics.map(characteristicLabel)) },
        { heading: "Questions Worth Discussing With Your Consultant", bullets: values(profile.consultantQuestions).slice(0, 5) },
        { heading: "Financial Context", paragraphs: [`Candidate-reported liquid capital: ${analysis.financial.liquidCapital}. Candidate-reported investment range: ${analysis.financial.investmentRange}.`, "Candidate-reported financial information has not been independently verified by FranGroove."] },
        { heading: "What Happens Next", paragraphs: ["Your consultant will use this profile as a starting point for Discovery and a more informed ownership conversation."] },
      ],
      disclaimer: "This assessment is not pass/fail and is not an immediate brand recommendation. Financial information is candidate-reported and not independently verified by FranGroove.",
    };
  }

  buildConsultantReport(source: Source): AssessmentReport {
    const { analysis } = source; const brief = analysis.consultantBrief;
    return {
      reportType: "CONSULTANT_INTELLIGENCE_REPORT", audience: "consultant", privacyClassification: "INTERNAL CONSULTANT USE",
      templateVersion: "consultant-report-v1", candidateName: source.candidateName,
      instrumentLabel: "Franchise Ownership Assessment v1.0", instrumentVersion: source.instrumentVersion ?? analysis.instrumentVersion,
      analysisVersion: analysis.analysisVersion, assessmentCompletedAt: source.completedAt, generatedAt: source.generatedAt ?? new Date().toISOString(),
      title: "Candidate Intelligence Report", subtitle: analysis.ownershipProfile.primary, source: analysis,
      sections: [
        { heading: "Consultant Brief", paragraphs: [brief.ownershipOrientation.text], bullets: [...brief.whatStandsOut.map(x=>x.text), ...brief.validateDuringDiscovery.map(x=>x.text)] },
        { heading: "Decision Dynamics", paragraphs: [brief.decisionDynamics.text] },
        { heading: "Financial Context", paragraphs: [brief.financialContext.text, "All financial information is candidate-reported and not independently verified by FranGroove."] },
        { heading: "Start Discovery Here", paragraphs: [brief.startDiscoveryHere.text] },
        { heading: "Motivation & Goals", bullets: values(analysis.ownershipProfile.motivations) },
        { heading: "Preferred Owner Role & Growth", bullets: values(analysis.ownershipProfile.operatingPreferences) },
        { heading: "Potential Tensions", bullets: values(analysis.tensions.map(x=>`${x.priority === "high" ? "Key priority" : "Validate"}: ${x.title} — ${x.explanation}`)) },
        { heading: "Discovery Priorities", bullets: values(analysis.discoveryPriorities.map(x=>`${x.title} (${x.priority} priority): ${x.whyItMatters} Suggested question: ${x.suggestedQuestion}`)) },
        { heading: "Opportunity Characteristics", bullets: values(analysis.opportunityCharacteristics.map(x=>`${x.characteristic} — ${x.disposition}: ${x.reason}`)) },
        { heading: "Supporting Evidence", bullets: values(analysis.evidenceDetails.map(x=>`${x.topic}: ${x.response}. ${x.interpretation}`)) },
      ],
      disclaimer: "Internal consultant intelligence and Discovery guidance. Do not share externally without an explicit professional review and sharing decision.",
    };
  }
}
