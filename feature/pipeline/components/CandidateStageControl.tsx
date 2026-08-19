"use client";

import { useActionState } from "react";
import { moveCandidateStageAction, type PipelineActionState } from "../actions/pipeline-actions";

const initial: PipelineActionState = { status: "idle" };
export function CandidateStageControl({ candidateId, currentStageId, stages }: { candidateId: string; currentStageId: string; stages: Array<{ stageId: string; label: string }> }) {
  const [state, action, pending] = useActionState(moveCandidateStageAction, initial);
  return <form action={action} className="mt-5 flex flex-wrap items-center gap-2"><input type="hidden" name="candidateId" value={candidateId} /><label className="sr-only" htmlFor="candidate-stage">Move candidate to stage</label><select id="candidate-stage" name="stageId" defaultValue={currentStageId} className="rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-sm font-bold text-white">{stages.map((stage) => <option key={stage.stageId} value={stage.stageId}>Move to {stage.label}</option>)}</select><button disabled={pending} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-900">{pending ? "Moving…" : "Move Candidate"}</button>{state.message && <span role="status" className="text-xs font-semibold text-slate-300">{state.message}</span>}</form>;
}
