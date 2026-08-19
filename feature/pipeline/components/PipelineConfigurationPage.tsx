"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { CanonicalLifecycleStage } from "@/feature/crm/models/CandidateRecord";
import type { ConsultantPipelineConfiguration, ConsultantPipelineStage } from "../models/ConsultantPipeline";
import { CANONICAL_LIFECYCLE_LABELS, suggestLifecycleMapping } from "../services/PipelineMappingService";
import { resetPipelineAction, savePipelineAction, type PipelineActionState } from "../actions/pipeline-actions";

const initial: PipelineActionState = { status: "idle" };
const mappings = Object.entries(CANONICAL_LIFECYCLE_LABELS) as Array<[CanonicalLifecycleStage, string]>;

export function PipelineConfigurationPage({ initialConfiguration }: { initialConfiguration: ConsultantPipelineConfiguration }) {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [saveState, saveAction, saving] = useActionState(savePipelineAction, initial);
  const [resetState, resetAction, resetting] = useActionState(resetPipelineAction, initial);
  const [newStageId, setNewStageId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingStageId, setRemovingStageId] = useState<string | null>(null);
  const [stageErrors, setStageErrors] = useState<Record<string, string>>({});
  const [removing, startRemoval] = useTransition();
  const addLock = useRef(false);
  const stages = configuration.stages;
  const movableStageIds = stages.filter((stage) => stage.enabled).map((stage) => stage.stageId);
  const update = (stageId: string, changes: Partial<ConsultantPipelineStage>) => { if (stageId === newStageId) setNewStageId(null); setConfiguration((current) => ({ ...current, stages: current.stages.map((stage) => stage.stageId === stageId ? { ...stage, ...changes } : stage) })); };
  const move = (stageId: string, offset: number) => setConfiguration((current) => { const stages = [...current.stages]; const movable = stages.map((stage, index) => ({ stage, index })).filter(({ stage }) => stage.enabled); const movableIndex = movable.findIndex(({ stage }) => stage.stageId === stageId); const target = movableIndex + offset; if (movableIndex < 0 || target < 0 || target >= movable.length) return current; const sourceIndex = movable[movableIndex].index; const targetIndex = movable[target].index; [stages[sourceIndex], stages[targetIndex]] = [stages[targetIndex], stages[sourceIndex]]; return { ...current, stages: stages.map((stage, order) => ({ ...stage, order })) }; });
  const addCustom = () => { if (addLock.current) return; addLock.current = true; setAdding(true); const now = new Date().toISOString(); const stage: ConsultantPipelineStage = { stageId: `custom-${crypto.randomUUID()}`, pipelineId: configuration.pipelineId, displayName: "Custom Stage", order: configuration.stages.length, enabled: true, canonicalLifecycleStage: "other", classification: "active", source: "custom", colorToken: "slate", createdAt: now, updatedAt: now }; setNewStageId(stage.stageId); setConfiguration((current) => ({ ...current, stages: [...current.stages, stage] })); };
  const removeStage = (stageId: string) => { setStageErrors((current) => ({ ...current, [stageId]: "" })); setRemovingStageId(stageId); startRemoval(async () => { const next = { ...configuration, stages: configuration.stages.filter((stage) => stage.stageId !== stageId).map((stage, order) => ({ ...stage, order })) }; const formData = new FormData(); formData.set("configuration", JSON.stringify(next)); const result = await savePipelineAction(initial, formData); if (result.status === "success") { setConfiguration(next); if (newStageId === stageId) setNewStageId(null); } else { setStageErrors((current) => ({ ...current, [stageId]: result.message ?? "The stage could not be removed." })); } setRemovingStageId(null); }); };

  useEffect(() => { if (!newStageId) return; const frame = window.requestAnimationFrame(() => { const row = document.querySelector<HTMLElement>(`[data-stage-id="${CSS.escape(newStageId)}"]`); row?.scrollIntoView({ behavior: "smooth", block: "center" }); row?.querySelector<HTMLInputElement>('input[aria-label^="Stage name"]')?.focus(); setAdding(false); addLock.current = false; }); return () => window.cancelAnimationFrame(frame); }, [newStageId]);

  return <main className="mx-auto max-w-6xl p-6 lg:p-10">
    <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Settings</p><h1 className="mt-2 text-4xl font-black text-slate-950">Pipeline Configuration</h1><p className="mt-3 max-w-3xl text-slate-600">Use the pipeline stages that fit the way you work. FranGroove maps your stages to its AI lifecycle so recommendations and analytics continue to work even when you customize your process.</p></div>
    <div className="mb-5 flex flex-wrap items-center gap-3"><button type="button" disabled={adding} onClick={addCustom} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">{adding ? "Adding Stage…" : "Add Custom Stage"}</button></div>
    <form action={saveAction} onSubmit={() => setNewStageId(null)} className="space-y-4">
      <input type="hidden" name="configuration" value={JSON.stringify(configuration)} />
      {stages.map((stage, index) => { const suggestion = stage.source === "custom" ? suggestLifecycleMapping(stage.displayName) : null; const movableIndex = movableStageIds.indexOf(stage.stageId); const isNew = stage.stageId === newStageId; return <section key={stage.stageId} className={`rounded-2xl border bg-white p-5 shadow-sm transition ${isNew ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200"}`} data-stage-id={stage.stageId}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="flex items-center gap-3"><input aria-label={`Enable ${stage.displayName}`} type="checkbox" checked={stage.enabled} onChange={(event) => update(stage.stageId, { enabled: event.target.checked })} /><span className="text-xs font-black uppercase tracking-wide text-slate-500">{stage.enabled ? "Enabled" : "Disabled"}</span></label>
          <label className="min-w-0 flex-1"><span className="sr-only">Stage name</span><input aria-label={`Stage name ${index + 1}`} value={stage.displayName} onChange={(event) => update(stage.stageId, { displayName: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-black text-slate-900" /></label>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">{isNew ? "New" : stage.source === "custom" ? "Custom" : "Recommended"}</span>
          {stage.source === "custom" && <button type="button" disabled={removing && removingStageId === stage.stageId} onClick={() => removeStage(stage.stageId)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50 disabled:opacity-50">{removing && removingStageId === stage.stageId ? "Removing…" : "Remove Stage"}</button>}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"><label className="text-sm font-bold text-slate-700">FranGroove AI Mapping<select aria-label={`FranGroove AI Mapping for ${stage.displayName}`} value={stage.canonicalLifecycleStage} onChange={(event) => update(stage.stageId, { canonicalLifecycleStage: event.target.value as CanonicalLifecycleStage })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold">{mappings.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-bold text-slate-700">Classification<select value={stage.classification} onChange={(event) => update(stage.stageId, { classification: event.target.value as ConsultantPipelineStage["classification"] })} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"><option value="active">Active</option><option value="won">Won</option><option value="lost">Lost</option><option value="archived">Archived</option></select></label><div className="flex gap-2"><button aria-label={`Move ${stage.displayName} up`} type="button" disabled={!stage.enabled || movableIndex === 0} onClick={() => move(stage.stageId, -1)} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-30">Move Up</button><button aria-label={`Move ${stage.displayName} down`} type="button" disabled={!stage.enabled || movableIndex === movableStageIds.length - 1} onClick={() => move(stage.stageId, 1)} className="rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-30">Move Down</button></div></div>
        {suggestion && suggestion !== stage.canonicalLifecycleStage && <button type="button" onClick={() => update(stage.stageId, { canonicalLifecycleStage: suggestion })} className="mt-3 text-xs font-bold text-blue-700">Suggested mapping: {CANONICAL_LIFECYCLE_LABELS[suggestion]} — Apply</button>}
        <p className="mt-3 text-xs text-slate-500">This mapping helps FranGroove understand where the candidate is in your process while letting you use your own terminology.</p>
        {stageErrors[stage.stageId] && <div role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">{stageErrors[stage.stageId]} <Link href="/crm/candidates" className="underline">Open the pipeline to reassign candidates.</Link></div>}
      </section>; })}
      <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl"><button disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white">{saving ? "Saving…" : "Save Changes"}</button>{saveState.message && <p role="status" className={saveState.status === "error" ? "text-sm font-bold text-red-700" : "text-sm font-bold text-emerald-700"}>{saveState.message}</p>}</div>
    </form>
    <form action={resetAction} className="mt-6"><button disabled={resetting} className="text-sm font-bold text-slate-600 underline">Reset to Recommended Pipeline</button>{resetState.message && <p role="status" className="mt-2 text-sm text-slate-600">{resetState.message}</p>}</form>
  </main>;
}
