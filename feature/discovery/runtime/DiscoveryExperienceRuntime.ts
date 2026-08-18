import type { CandidateRecord, PipelineStage } from "@/feature/crm/models/CandidateRecord";
import type { DemoCandidate } from "@/feature/demo/models/DemoScenario";
import type { DiscoveryExperienceState, DiscoveryObjectiveState, DiscoveryQuestionState } from "../models/DiscoveryExperienceState";

const labels: Partial<Record<PipelineStage, string>> = { "assessment-completed": "Assessment Complete", discovery: "Discovery", validation: "Validation", "brand-matching": "Brand Strategy", referral: "Referral", awarded: "Awarded" };
const questionByObjective: Record<string, string> = {
  motivation: "What outcome would make business ownership personally meaningful for you?",
  family: "How does your family feel about your move into business ownership?",
  investment: "What investment range would feel comfortable after considering your financing structure?",
  timeline: "When would you ideally like to begin operating a business?",
};

export class DiscoveryExperienceRuntime {
  build(candidate: CandidateRecord & { intelligence: NonNullable<CandidateRecord["intelligence"]> }, scenario: DemoCandidate | null, requestedPhase?: "live"): DiscoveryExperienceState {
    const risks = scenario?.discovery.detectedRisks ?? [];
    const priorities = candidate.intelligence.discoveryPriorities;
    const has = (pattern: RegExp) => risks.some((item) => pattern.test(item)) || priorities.some((item) => pattern.test(item));
    const objectives: DiscoveryObjectiveState[] = [
      this.objective("motivation", "Ownership Motivation", scenario?.discovery.detectedBuyingSignals.length ? "validated" : "partial", scenario?.discovery.detectedBuyingSignals.join(" ") || "Assessment motivation exists, but Discovery evidence is limited.", "high", scenario?.discovery.detectedBuyingSignals.length ? ["meeting"] : ["assessment"]),
      this.objective("family", "Family Alignment", has(/family|spouse/i) ? "needs-validation" : "validated", has(/family|spouse/i) ? "Family or spouse support has not been confirmed." : "No unresolved family-alignment concern is recorded.", "high", has(/family|spouse/i) ? ["meeting"] : ["assessment"]),
      this.objective("investment", "Investment Expectations", "partial", `Financial capacity is known (${candidate.intelligence.financial.investmentRange}); investment comfort still needs confirmation.`, "medium", ["assessment"]),
      this.objective("timeline", "Buying Timeline", candidate.intelligence.timing.decisionWindow ? "partial" : "unknown", candidate.intelligence.timing.decisionWindow || "No target decision window is established.", "medium", ["assessment"]),
    ];
    const unresolved = objectives.filter((item) => item.status !== "validated").sort((a, b) => this.rank(a.priority) - this.rank(b.priority));
    const questions = unresolved.map((objective) => this.question(objective));
    const primaryQuestion = questions[0] ?? this.question(objectives[0]);
    const target = has(/confirm|validate|risk|unresolved|family|spouse/i) ? "validation-required" : "ready-for-brand-strategy";
    const historical = ["brand-matching", "referral", "awarded"].includes(candidate.pipelineStage);
    return {
      phase: historical ? "post-meeting" : requestedPhase ?? (candidate.pipelineStage === "discovery" && scenario?.pipelineStage === "assessment-completed" ? "live" : "pre-meeting"), historical,
      candidate: { id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}`, stage: candidate.pipelineStage, stageLabel: labels[candidate.pipelineStage] ?? candidate.pipelineStage, readiness: candidate.intelligence.overallReadiness, buyingConfidence: candidate.intelligence.timing.confidence, momentum: scenario?.buyingMomentum ?? "steady", financialContext: candidate.intelligence.financial.investmentRange },
      summary: candidate.intelligence.executiveSummary,
      strengths: [candidate.intelligence.behavioral.leadershipStyle, `${candidate.intelligence.behavioral.coachability}% coachability`, ...candidate.intelligence.preferredBusinessModels].slice(0, 3),
      objectives, primaryQuestion, secondaryQuestions: questions.slice(1),
      buyingSignals: (scenario?.discovery.detectedBuyingSignals ?? []).map((label) => ({ label, reason: "Recorded in deterministic Discovery evidence.", confidence: candidate.intelligence.timing.confidence })),
      risks: risks.map((label) => ({ label, reason: "This remains unresolved in current Discovery evidence.", confidence: 82, severity: /critical|urgent/i.test(label) ? "critical" : "concern" })),
      recentActivity: (scenario?.recentActivity ?? []).slice(-4).reverse().map((item) => ({ title: item.title, detail: item.detail, occurredAt: item.occurredAt })),
      notes: scenario?.discovery.notes ?? "No Discovery notes have been recorded.", changes: [],
      completion: target === "validation-required"
        ? { outcome: target, heading: "Discovery Complete · Validation Required", explanation: unresolved.filter((item) => item.priority === "high").map((item) => item.evidenceSummary).join(" ") || "High-priority evidence remains unresolved.", actionLabel: "Begin Validation" }
        : { outcome: target, heading: "Discovery Complete · Ready for Brand Strategy", explanation: "Discovery contains sufficient evidence to continue into Brand Strategy.", actionLabel: "Review Brand Strategy" },
    };
  }

  private objective(id: string, label: string, status: DiscoveryObjectiveState["status"], evidenceSummary: string, priority: DiscoveryObjectiveState["priority"], sources: DiscoveryObjectiveState["sources"]): DiscoveryObjectiveState { return { id, label, status, evidenceSummary, priority, sources }; }
  private question(objective: DiscoveryObjectiveState): DiscoveryQuestionState { return { id: `question-${objective.id}`, question: questionByObjective[objective.id] ?? `What should we clarify about ${objective.label.toLowerCase()}?`, reason: `${objective.label} is the highest-priority unresolved Discovery objective.`, objectiveId: objective.id, priority: objective.priority, source: "objective-gap" }; }
  private rank(priority: DiscoveryObjectiveState["priority"]) { return priority === "high" ? 0 : priority === "medium" ? 1 : 2; }
}
