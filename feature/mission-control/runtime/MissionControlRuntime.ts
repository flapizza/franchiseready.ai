import type { BrandProfile } from "@/feature/brand-library/models/BrandProfile";
import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import type { DemoCandidate } from "@/feature/demo/models/DemoScenario";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";

import type {
  IntelligenceEventState,
  IntroductionReadyState,
  MissionControlAction,
  MissionControlPriority,
  MissionControlState,
  PriorityCandidateState,
  RecommendedActionState,
  TopOpportunityState,
} from "../models/MissionControlState";

const candidateName = (candidate: DemoCandidate) =>
  `${candidate.firstName} ${candidate.lastName}`;

const candidateWorkspaceHref = (candidateId: string) =>
  `/crm/${candidateId}`;

const candidateBriefingHref = (candidateId: string) =>
  `/crm/${candidateId}/briefing`;

function stageLabel(stage: DemoCandidate["pipelineStage"]): string {
  if (stage === "brand-matching") return "Brand Strategy Ready";
  if (stage === "assessment-completed") return "Assessment Complete";

  return stage
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function priorityScore(candidate: DemoCandidate): number {
  if (candidate.buyingMomentum === "slowing") return 120;

  if (candidate.discovery.detectedRisks.length > 0) {
    if (candidate.pipelineStage === "validation") {
      return 100 + candidate.intelligence.overallReadiness / 100;
    }

    return 80 + candidate.intelligence.overallReadiness / 100;
  }

  if (candidate.pipelineStage === "brand-matching") {
    return 90 + candidate.intelligence.overallReadiness / 100;
  }

  if (candidate.pipelineStage === "assessment-completed") return 60;

  return candidate.confidence / 10;
}

function priorityLevel(score: number): MissionControlPriority {
  if (score >= 110) return "critical";
  if (score >= 90) return "high";
  return "normal";
}

function opportunityScore(candidate: DemoCandidate): number {
  const lifecycleValue = candidate.pipelineStage === "referral"
    ? 200
    : candidate.pipelineStage === "brand-matching"
      ? 100
      : 0;

  return lifecycleValue + candidate.referralReadiness + candidate.confidence;
}

export class MissionControlRuntime {
  public constructor(
    private readonly scenarioRepository: DemoScenarioRepository =
      new SeedDemoScenarioRepository(),
    private readonly brandRepository = new SeedBrandRepository(),
    private readonly candidateRepository: CandidateRepository = new SeedCandidateRepository(),
  ) {}

  public async build(): Promise<MissionControlState> {
    const [scenario, brands, candidateRecords] = await Promise.all([
      this.scenarioRepository.getScenario(),
      this.brandRepository.getAll(),
      this.candidateRepository.getAll(),
    ]);

    const recordsById = new Map(candidateRecords.map((candidate) => [candidate.id, candidate]));
    const scenarioCandidates: DemoCandidate[] = scenario.candidates.map((candidate) => {
      const record = recordsById.get(candidate.id);
      return record?.intelligence ? { ...candidate, ...record, intelligence: record.intelligence } : candidate;
    });

    const activeCandidates = scenarioCandidates.filter(
      (candidate) => candidate.status === "active",
    );
    const brandsById = new Map(brands.map((brand) => [brand.id, brand]));

    const topCandidate = [...activeCandidates]
      .sort((left, right) => opportunityScore(right) - opportunityScore(left))[0];

    if (!topCandidate) {
      throw new Error("Mission Control requires at least one active candidate.");
    }

    const priorityCandidates = this.buildPriorityCandidates(
      activeCandidates.filter((candidate) => candidate.id !== topCandidate.id),
    );
    const introductionReady = this.buildIntroductionReady(
      activeCandidates,
      brandsById,
    );

    return {
      consultantName: scenario.consultant.firstName,
      dailyBrief: {
        summary: `${activeCandidates.length} active candidates · ${scenario.meetings.length} meetings today · ${priorityCandidates.length} candidates need attention.`,
        priorities: priorityCandidates.map((candidate) => ({
          candidateId: candidate.candidateId,
          candidateName: candidate.candidateName,
          priority: candidate.priority,
          recommendedAction: candidate.recommendedAction,
        })),
        kpis: [
          {
            id: "active-candidates",
            label: "Active Candidates",
            value: activeCandidates.length,
          },
          {
            id: "discovery-meetings",
            label: "Discovery Meetings",
            value: scenario.meetings.length,
          },
          {
            id: "brand-strategy-ready",
            label: "Ready for Brand Strategy",
            value: activeCandidates.filter(
              (candidate) => candidate.pipelineStage === "brand-matching",
            ).length,
          },
          {
            id: "priority-actions",
            label: "AI Priority Actions",
            value: priorityCandidates.length,
          },
        ],
      },
      topOpportunity: this.buildTopOpportunity(topCandidate, brandsById),
      priorityCandidates,
      agenda: scenario.meetings.flatMap((meeting) => {
        const candidate = activeCandidates.find(
          (item) => item.id === meeting.candidateId,
        );

        if (!candidate) return [];

        return [{
          id: meeting.id,
          candidateId: candidate.id,
          candidateName: candidateName(candidate),
          time: meeting.time,
          objective: meeting.focus,
          status: stageLabel(candidate.pipelineStage),
          briefingHref: candidateBriefingHref(candidate.id),
        }];
      }),
      recommendedActions: this.buildRecommendedActions(
        activeCandidates,
        brandsById,
      ),
      introductionReady,
      intelligenceFeed: this.buildIntelligenceFeed(activeCandidates),
    };
  }

  private buildPriorityCandidates(
    candidates: DemoCandidate[],
  ): PriorityCandidateState[] {
    return [...candidates]
      .sort((left, right) => priorityScore(right) - priorityScore(left))
      .slice(0, 3)
      .map((candidate) => {
        const score = priorityScore(candidate);

        return {
          candidateId: candidate.id,
          candidateName: candidateName(candidate),
          reason: candidate.aiExplanation,
          priority: priorityLevel(score),
          recommendedAction: candidate.nextBestAction,
          openCandidateHref: candidateWorkspaceHref(candidate.id),
        };
      });
  }

  private buildTopOpportunity(
    candidate: DemoCandidate,
    brandsById: Map<string, BrandProfile>,
  ): TopOpportunityState {
    const bestBrand = brandsById.get(candidate.recommendedBrands[0]?.brandId);
    const isReferralReady = candidate.pipelineStage === "referral";
    const referralPackages = demoCandidateOverlayStore.getCandidateReferrals(candidate.id);
    const introduced = referralPackages.filter((item) => item.status === "introduced").length;
    const approved = referralPackages.filter((item) => item.status === "approved").length;
    const primaryAction: MissionControlAction = isReferralReady
      ? { label: introduced ? `View ${introduced} Introduction${introduced === 1 ? "" : "s"}` : approved ? `Record ${approved} Introduction${approved === 1 ? "" : "s"}` : referralPackages.length ? "Continue Referrals" : "Generate Referral Packages", href: `/crm/candidates/${candidate.id}/referral` }
      : {
          label: candidate.nextBestAction,
          href: candidateWorkspaceHref(candidate.id),
        };

    return {
      candidateId: candidate.id,
      candidateName: candidateName(candidate),
      rationale: candidate.aiExplanation,
      confidence: candidate.confidence,
      readiness: candidate.intelligence.overallReadiness,
      momentum: candidate.buyingMomentum,
      bestBrand: bestBrand?.name ?? "Recommendation pending",
      estimatedTimeline: candidate.intelligence.timing.decisionWindow,
      primaryAction,
      secondaryActions: [
        {
          label: "Open Candidate",
          href: candidateWorkspaceHref(candidate.id),
        },
        { label: "Review Brand Strategy", href: `/crm/candidates/${candidate.id}/strategy` },
      ],
    };
  }

  private buildIntroductionReady(
    candidates: DemoCandidate[],
    brandsById: Map<string, BrandProfile>,
  ): IntroductionReadyState[] {
    return candidates
      .filter(
        (candidate) =>
          candidate.pipelineStage === "referral" ||
          candidate.referralReadiness >= 90,
      )
      .sort((left, right) => right.referralReadiness - left.referralReadiness)
      .slice(0, 2)
      .map((candidate) => ({
        candidateId: candidate.id,
        candidateName: candidateName(candidate),
        brandName:
          brandsById.get(candidate.recommendedBrands[0]?.brandId)?.name ??
          "Recommendation pending",
        confidence: candidate.confidence,
        action: { label: demoCandidateOverlayStore.getCandidateReferrals(candidate.id).some((item) => item.status === "introduced") ? "View Introductions" : "Open Referral Studio", href: `/crm/candidates/${candidate.id}/referral` },
      }));
  }

  private buildRecommendedActions(
    candidates: DemoCandidate[],
    brandsById: Map<string, BrandProfile>,
  ): RecommendedActionState[] {
    const referralCandidate = [...candidates]
      .filter((candidate) => candidate.pipelineStage === "referral")
      .sort((left, right) => right.referralReadiness - left.referralReadiness)[0];
    const momentumCandidate = [...candidates]
      .filter((candidate) => candidate.buyingMomentum === "slowing")
      .sort((left, right) => left.healthScore - right.healthScore)[0];
    const strategyCandidate = [...candidates]
      .filter((candidate) => candidate.pipelineStage === "brand-matching")
      .sort((left, right) => right.confidence - left.confidence)[0];

    const actions: RecommendedActionState[] = [];

    if (referralCandidate) {
      const brand = brandsById.get(
        referralCandidate.recommendedBrands[0]?.brandId,
      );
      const referralPackages = demoCandidateOverlayStore.getCandidateReferrals(referralCandidate.id);
      const introduced = referralPackages.filter((item) => item.status === "introduced").length;
      const awaitingApproval = referralPackages.filter((item) => item.status === "ready-for-review").length;
      actions.push({
        id: `referral-${referralCandidate.id}`,
        candidateId: referralCandidate.id,
        candidateName: candidateName(referralCandidate),
        signal: introduced ? `${introduced} Introduction${introduced === 1 ? "" : "s"} Recorded` : awaitingApproval ? `${awaitingApproval} Referral${awaitingApproval === 1 ? "" : "s"} Awaiting Approval` : "Ready for Introduction",
        recommendation: introduced ? "Review candidate referral activity" : awaitingApproval ? "Review prepared referral packages" : `Prepare ${brand?.name ?? "recommended brand"} referral opportunities`,
        action: { label: referralPackages.length ? "Open" : "Prepare", href: `/crm/candidates/${referralCandidate.id}/referral` },
        tone: "emerald",
      });
    }

    if (momentumCandidate) {
      actions.push({
        id: `momentum-${momentumCandidate.id}`,
        candidateId: momentumCandidate.id,
        candidateName: candidateName(momentumCandidate),
        signal: "Momentum Risk",
        recommendation: momentumCandidate.nextBestAction,
        action: {
          label: "Prepare",
          href: candidateBriefingHref(momentumCandidate.id),
        },
        tone: "amber",
      });
    }

    if (strategyCandidate) {
      actions.push({
        id: `strategy-${strategyCandidate.id}`,
        candidateId: strategyCandidate.id,
        candidateName: candidateName(strategyCandidate),
        signal: "Discovery Complete",
        recommendation: strategyCandidate.nextBestAction,
        action: { label: "Review", href: `/crm/candidates/${strategyCandidate.id}/strategy` },
        tone: "blue",
      });
    }

    return actions.slice(0, 3);
  }

  private buildIntelligenceFeed(
    candidates: DemoCandidate[],
  ): IntelligenceEventState[] {
    const events: IntelligenceEventState[] = [];
    const append = (
      candidate: DemoCandidate | undefined,
      event: Omit<
        IntelligenceEventState,
        "candidateId" | "candidateName"
      >,
    ) => {
      if (!candidate) return;
      events.push({
        ...event,
        candidateId: candidate.id,
        candidateName: candidateName(candidate),
      });
    };

    append(
      candidates.find((candidate) => candidate.pipelineStage === "assessment-completed"),
      {
        id: "assessment-completed",
        type: "assessment-completed",
        label: "Assessment Completed",
        explanation: "Candidate Intelligence profile generated from completed assessment evidence.",
        dateLabel: "Yesterday",
      },
    );
    append(
      candidates.find((candidate) => candidate.buyingMomentum === "slowing"),
      {
        id: "momentum-change",
        type: "momentum-change",
        label: "Momentum Change Detected",
        explanation: "Candidate engagement has slowed and a focused follow-up is recommended.",
        dateLabel: "Today",
      },
    );
    append(
      [...candidates]
        .filter((candidate) => candidate.pipelineStage === "brand-matching")
        .sort((left, right) => right.confidence - left.confidence)[0],
      {
        id: "brand-readiness",
        type: "brand-readiness",
        label: "Brand Readiness Reached",
        explanation: "Discovery evidence reached the confidence threshold for Brand Strategy.",
        dateLabel: "Today",
      },
    );
    append(
      candidates.find(
        (candidate) =>
          candidate.pipelineStage === "validation" &&
          candidate.discovery.detectedRisks.length > 0,
      ),
      {
        id: "risk-signal",
        type: "risk-signal",
        label: "Risk Signal Identified",
        explanation: "Discovery intelligence identified an unresolved validation issue.",
        dateLabel: "Today",
      },
    );
    append(
      [...candidates]
        .filter((candidate) => candidate.pipelineStage === "referral")
        .sort((left, right) => right.referralReadiness - left.referralReadiness)[0],
      {
        id: "referral-ready",
        type: "referral-ready",
        label: "Referral Ready",
        explanation: "Candidate and brand alignment reached the introduction threshold.",
        dateLabel: "Today",
      },
    );

    return events;
  }
}
