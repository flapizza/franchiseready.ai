import type { PersistedCandidateWorkspace } from "@/feature/crm/models/PersistedCandidateWorkspace";

export const stageOrder = ["lead", "assessment-started", "assessment-completed", "discovery", "education", "brand-matching", "validation", "referral", "fdd-delivered", "funding", "meet-the-team", "awarded", "training", "opened", "closed-lost"];
export const stageLabel = (stage: string) => stage.split("-").map(x => x[0]?.toUpperCase() + x.slice(1)).join(" ");
export const candidateHref = (id: string) => `/crm/candidates/${encodeURIComponent(id)}`;
const date = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;

export function candidateSignals(row: PersistedCandidateWorkspace, now = Date.now()) {
  const { candidate: c, assessment: a, discovery: d } = row;
  const analysis = a?.analysis;
  const lastProgress = Math.max(date(c.updatedAt), date(a?.savedAt), date(a?.completedAt), date(d?.updatedAt));
  const unresolved = d?.observations.filter(o => o.followUpNeeded || o.status === "unclear" || o.status === "contradicted") ?? [];
  const reasons: string[] = [];
  if (c.status === "on-hold") reasons.push("Candidate is on hold; confirm the conditions for resuming.");
  if (unresolved.length) reasons.push(`${unresolved.length} Discovery finding${unresolved.length === 1 ? " needs" : "s need"} clarification or follow-up.`);
  if (a && ["created", "invited", "in-progress", "submitted"].includes(a.status)) reasons.push("Assessment is not yet complete; agree on the next step with the candidate.");
  if (a && ["expired", "cancelled"].includes(a.status)) reasons.push("Assessment invitation needs review before the candidate can continue.");
  if (lastProgress && now - lastProgress >= 14 * 86400000) reasons.push("No recorded candidate, assessment or Discovery update in at least 14 days.");
  if (d?.status === "completed" && !d.nextSteps.trim()) reasons.push("Discovery is complete without a recorded consultant next step.");
  if (["validation", "referral"].includes(c.pipelineStage) && !d?.nextSteps.trim()) reasons.push("Advanced pipeline stage needs explicit next-step context.");
  if (analysis && !d) reasons.push("Assessment intelligence is available; begin consultant-led Discovery.");
  if (d?.currentIntelligence?.readiness === "ready-for-brand-strategy" && !unresolved.length) reasons.push("Discovery evidence supports a consultant review of brand fit.");
  const nextAction = d?.nextSteps.trim() || unresolved[0]?.finding || reasons[0] || (analysis ? "Review the Brand Referral Engine and validate remaining evidence gaps." : "Agree on goals and prepare an assessment invitation.");
  return { reasons, nextAction, lastProgress, priority: c.status === "on-hold" || unresolved.length ? 0 : a && !analysis ? 1 : 2,
    assessmentLabel: analysis ? "Assessment Complete" : a ? stageLabel(a.status) : "Not Started" };
}

export function buildPersistedMissionControl(rows: PersistedCandidateWorkspace[], now = Date.now()) {
  const open = rows.filter(r => ["active", "on-hold"].includes(r.candidate.status));
  const candidates = open.map(row => ({ ...row, ...candidateSignals(row, now), href: candidateHref(row.candidate.id), name: `${row.candidate.firstName} ${row.candidate.lastName}` }));
  const stages = [...new Set(open.map(r => r.candidate.pipelineStageId ?? r.candidate.pipelineStage))]
    .sort((a, b) => (stageOrder.indexOf(a) < 0 ? 99 : stageOrder.indexOf(a)) - (stageOrder.indexOf(b) < 0 ? 99 : stageOrder.indexOf(b)) || a.localeCompare(b))
    .map(id => ({ id, label: stageLabel(id), candidates: candidates.filter(r => (r.candidate.pipelineStageId ?? r.candidate.pipelineStage) === id) }));
  const activity = rows.flatMap(row => {
    const common = { candidateId: row.candidate.id, name: `${row.candidate.firstName} ${row.candidate.lastName}`, href: candidateHref(row.candidate.id) };
    return [
      { ...common, label: "Candidate record updated", at: row.candidate.updatedAt },
      ...(row.assessment?.completedAt && row.assessment.analysis ? [{ ...common, label: "Assessment intelligence generated", at: row.assessment.completedAt }] : []),
      ...(row.assessment?.savedAt && !row.assessment.analysis ? [{ ...common, label: "Assessment progress saved", at: row.assessment.savedAt }] : []),
      ...(row.discovery ? [{ ...common, label: "Discovery record updated", at: row.discovery.updatedAt }] : []),
    ];
  }).filter(x => date(x.at)).sort((a, b) => date(b.at) - date(a.at) || a.candidateId.localeCompare(b.candidateId)).slice(0, 8);
  return { total: open.length, active: open.filter(r => r.candidate.status === "active").length, onHold: open.filter(r => r.candidate.status === "on-hold").length,
    completed: open.filter(r => r.assessment?.analysis).length,
    inProgress: open.filter(r => r.assessment && ["created", "invited", "in-progress", "submitted"].includes(r.assessment.status)).length,
    matching: open.filter(r => r.candidate.pipelineStage === "brand-matching").length,
    advanced: open.filter(r => ["validation", "referral"].includes(r.candidate.pipelineStage)).length,
    attention: candidates.filter(r => r.reasons.length).sort((a, b) => a.priority - b.priority || a.lastProgress - b.lastProgress || a.name.localeCompare(b.name)), candidates, stages, activity };
}
