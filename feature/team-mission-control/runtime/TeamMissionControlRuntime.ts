import type { DemoCandidate } from "@/feature/demo/models/DemoScenario";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { createRecommendedPipeline } from "@/feature/pipeline/data/defaultPipeline";
import type { TeamMissionControlState, TeamMemberProfile, TeamMemberSummary, TeamScopeOption, TeamWorkSignal } from "../models/TeamMissionControlState";
import type { TeamOperationsRepository } from "../repositories/TeamOperationsRepository";
import { DemoTeamOperationsRepository } from "../repositories/DemoTeamOperationsRepository";

const DATE_LABEL = "Friday, August 21, 2026";

function descendants(members: TeamMemberProfile[], rootId: string): TeamMemberProfile[] {
  const result: TeamMemberProfile[] = [];
  const visit = (parentId: string) => members.filter((member) => member.managerId === parentId).forEach((member) => {
    result.push(member);
    visit(member.id);
  });
  visit(rootId);
  return result;
}

function memberDepth(members: TeamMemberProfile[], member: TeamMemberProfile): number {
  let depth = 0;
  let current = member;
  while (current.managerId) {
    depth += 1;
    const parent = members.find((item) => item.id === current.managerId);
    if (!parent) break;
    current = parent;
  }
  return depth;
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export class TeamMissionControlRuntime {
  constructor(
    private readonly operations: TeamOperationsRepository = new DemoTeamOperationsRepository(),
    private readonly scenarios: DemoScenarioRepository = new SeedDemoScenarioRepository(),
  ) {}

  async build(requestedScope = "all"): Promise<TeamMissionControlState> {
    const [viewer, members, assignments, signals, scenario] = await Promise.all([
      this.operations.getViewer(), this.operations.getMembers(), this.operations.getCandidateAssignments(),
      this.operations.getWorkSignals(), this.scenarios.getScenario(),
    ]);
    const authorizedMembers = [viewer, ...descendants(members, viewer.id)];
    const authorizedIds = new Set(authorizedMembers.map((member) => member.id));
    const requestedMember = authorizedMembers.find((member) => member.id === requestedScope);
    const selectedIds = requestedScope === "self"
      ? new Set([viewer.id])
      : requestedMember
        ? new Set([requestedMember.id, ...descendants(authorizedMembers, requestedMember.id).map((member) => member.id)])
        : authorizedIds;
    const assignmentByCandidate = new Map(assignments.filter((item) => authorizedIds.has(item.memberId)).map((item) => [item.candidateId, item.memberId]));
    const scopedCandidates = scenario.candidates.filter((candidate) => {
      const memberId = assignmentByCandidate.get(candidate.id);
      return Boolean(memberId && selectedIds.has(memberId));
    });
    const scopedSignals = signals.filter((signal) => selectedIds.has(signal.memberId));
    const membersById = new Map(authorizedMembers.map((member) => [member.id, member]));
    const candidatesById = new Map(scenario.candidates.map((candidate) => [candidate.id, candidate]));
    const pipeline = createRecommendedPipeline(viewer.id);
    const stageFor = (candidate: DemoCandidate) => pipeline.stages.find((stage) => stage.legacyLifecycleStage === candidate.pipelineStage) ?? pipeline.stages[0];
    const scopeOptions = this.scopeOptions(viewer, authorizedMembers);
    const selectedScope = scopeOptions.find((scope) => scope.id === requestedScope) ?? scopeOptions[0];

    const pipelineCandidates = scopedCandidates.map((candidate) => {
      const owner = membersById.get(assignmentByCandidate.get(candidate.id)!)!;
      const stage = stageFor(candidate);
      const risk = candidate.buyingMomentum === "slowing" || candidate.discovery.detectedRisks.length > 0;
      return {
        id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`, initials: candidate.initials,
        owner, stage: candidate.pipelineStage, stageLabel: stage.displayName, canonicalStage: stage.canonicalLifecycleStage,
        readiness: candidate.intelligence?.overallReadiness ?? null, nextAction: candidate.nextBestAction,
        attention: risk, attentionLabel: candidate.buyingMomentum === "slowing" ? "Momentum slowing" : candidate.discovery.detectedRisks[0] ?? "On track",
        lastActivityLabel: dateLabel(candidate.lastActivityAt), href: `/crm/candidates/${candidate.id}`,
      };
    }).sort((left, right) => Number(right.attention) - Number(left.attention) || (right.readiness ?? 0) - (left.readiness ?? 0));

    const summaries = authorizedMembers.filter((member) => selectedIds.has(member.id)).map((member) =>
      this.memberSummary(member, scopedCandidates, assignments, signals, requestedMember?.id === member.id || requestedScope === "self" && member.id === viewer.id),
    );
    const attention = this.attention(scopedCandidates, scopedSignals, assignmentByCandidate, membersById);
    const activeCandidates = scopedCandidates.filter((candidate) => candidate.status === "active");
    const meetings = scopedSignals.filter((signal) => signal.kind === "meeting");
    const urgentTasks = scopedSignals.filter((signal) => signal.kind === "task" && (signal.overdue || signal.highPriority));
    const referrals = scopedSignals.filter((signal) => signal.kind === "referral");

    return {
      teamName: "Carolinas Growth Team", viewer, dateLabel: DATE_LABEL,
      health: attention.length >= 4
        ? { label: "Focused intervention", detail: `${attention.length} situations need leadership attention across this scope.`, attentionCount: attention.length }
        : { label: "Team on track", detail: `${attention.length} focused intervention${attention.length === 1 ? "" : "s"} in this scope.`, attentionCount: attention.length },
      selectedScope, scopeOptions,
      metrics: [
        { id: "active", label: "Active candidates", value: activeCandidates.length, detail: `${scopedCandidates.length} total relationships`, tone: "blue" },
        { id: "opportunity", label: "Decision opportunities", value: scopedCandidates.filter((candidate) => ["brand-matching", "validation", "referral"].includes(candidate.pipelineStage)).length, detail: "Strategy through referral", tone: "teal" },
        { id: "meetings", label: "Meetings this week", value: meetings.length, detail: `${meetings.filter((meeting) => meeting.whenLabel.includes("Today")).length} today`, tone: "slate" },
        { id: "tasks", label: "Tasks needing attention", value: urgentTasks.length, detail: `${urgentTasks.filter((task) => task.overdue).length} overdue`, tone: "amber" },
        { id: "referrals", label: "Referrals in motion", value: referrals.length, detail: "Prepared or introduced", tone: "teal" },
        { id: "risk", label: "Candidates at risk", value: pipelineCandidates.filter((candidate) => candidate.attention).length, detail: "Momentum or evidence risk", tone: "rose" },
      ],
      members: summaries,
      pipeline: pipelineCandidates,
      pipelineStages: pipeline.stages.filter((stage) => pipelineCandidates.some((candidate) => candidate.stageLabel === stage.displayName)).map((stage) => ({ id: stage.stageId, label: stage.displayName, count: pipelineCandidates.filter((candidate) => candidate.stageLabel === stage.displayName).length })),
      attention,
      activity: scopedSignals.map((signal) => ({ ...signal, owner: membersById.get(signal.memberId)!, candidateName: signal.candidateId ? this.name(candidatesById.get(signal.candidateId)) : undefined })),
      scopedMember: requestedMember ? summaries.find((member) => member.id === requestedMember.id) : requestedScope === "self" ? summaries.find((member) => member.id === viewer.id) : undefined,
    };
  }

  private scopeOptions(viewer: TeamMemberProfile, members: TeamMemberProfile[]): TeamScopeOption[] {
    return [
      { id: "all", label: "All team", description: "Entire authorized branch", depth: 0 },
      { id: "self", label: "My pipeline", description: viewer.name, depth: 0, memberId: viewer.id },
      ...members.filter((member) => member.id !== viewer.id).map((member) => ({
        id: member.id, label: member.name, description: member.roleLabel, depth: Math.max(0, memberDepth(members, member) - 1), memberId: member.id,
      })),
    ];
  }

  private memberSummary(member: TeamMemberProfile, candidates: DemoCandidate[], assignments: Array<{ candidateId: string; memberId: string }>, signals: TeamWorkSignal[], selected: boolean): TeamMemberSummary {
    const ownIds = new Set(assignments.filter((item) => item.memberId === member.id).map((item) => item.candidateId));
    const own = candidates.filter((candidate) => ownIds.has(candidate.id));
    const ownSignals = signals.filter((signal) => signal.memberId === member.id);
    const attention = own.filter((candidate) => candidate.buyingMomentum === "slowing" || candidate.discovery.detectedRisks.length > 0).length + ownSignals.filter((signal) => signal.overdue).length;
    const stageCounts = new Map<string, number>();
    own.forEach((candidate) => stageCounts.set(candidate.pipelineStage, (stageCounts.get(candidate.pipelineStage) ?? 0) + 1));
    return { ...member, candidateCount: own.filter((candidate) => candidate.status === "active").length,
      meetingsThisWeek: ownSignals.filter((signal) => signal.kind === "meeting").length,
      overdueTasks: ownSignals.filter((signal) => signal.kind === "task" && signal.overdue).length,
      activeReferrals: ownSignals.filter((signal) => signal.kind === "referral").length, attentionCount: attention,
      latestActivity: ownSignals[0]?.whenLabel ?? (own[0] ? dateLabel(own[0].lastActivityAt) : "No recent activity"),
      pipelineSummary: [...stageCounts].map(([stage, count]) => `${count} ${stage.replaceAll("-", " ")}`).join(" · ") || "No active candidates",
      selected, scopeHref: `/crm/team?scope=${encodeURIComponent(member.id)}` };
  }

  private attention(candidates: DemoCandidate[], signals: TeamWorkSignal[], assignmentByCandidate: Map<string, string>, members: Map<string, TeamMemberProfile>) {
    const signalByCandidate = new Map(signals.filter((signal) => signal.candidateId && (signal.overdue || signal.highPriority || signal.kind === "referral")).map((signal) => [signal.candidateId!, signal]));
    return candidates.flatMap((candidate) => {
      const signal = signalByCandidate.get(candidate.id);
      const candidateRisk = candidate.buyingMomentum === "slowing" || candidate.discovery.detectedRisks.length > 0;
      if (!signal && !candidateRisk) return [];
      const owner = members.get(assignmentByCandidate.get(candidate.id)!)!;
      const reason = signal?.detail ?? candidate.discovery.detectedRisks[0] ?? "Buying momentum has slowed and the next commitment is not secured.";
      return [{ id: `attention-${candidate.id}`, title: signal?.title ?? "Candidate momentum needs intervention", candidateName: `${candidate.firstName} ${candidate.lastName}`, owner, reason,
        actionLabel: signal?.kind === "task" ? "Open tasks" : signal?.kind === "referral" ? "Review referral" : "Open candidate", href: signal?.href ?? `/crm/candidates/${candidate.id}`,
        severity: signal?.overdue || candidate.buyingMomentum === "slowing" ? "critical" as const : signal?.highPriority ? "high" as const : "watch" as const }];
    }).slice(0, 6);
  }

  private name(candidate?: DemoCandidate) { return candidate ? `${candidate.firstName} ${candidate.lastName}` : undefined; }
}
