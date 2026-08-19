"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Columns3, GripVertical, List, Search, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import type { CandidateCRMItem, CandidateCRMState } from "../models/CandidateCRMState";
import { CandidateLifecycleAction } from "./CandidateLifecycleAction";
import { moveCandidateStage } from "@/feature/pipeline/actions/pipeline-actions";

type QuickFilter = "all" | "active" | "attention" | "referral";
type View = "list" | "pipeline";

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All Candidates" },
  { id: "active", label: "Active" },
  { id: "attention", label: "Needs Attention" },
  { id: "referral", label: "Referral Ready" },
];

function attentionClass(attention: CandidateCRMItem["attention"]) {
  if (attention === "needs-attention") return "border-amber-200 bg-amber-50 text-amber-700";
  if (attention === "referral-ready") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function stagePresentation(stage: string) {
  if (stage.includes("awarded")) return { header: "border-slate-800 bg-slate-900", marker: "bg-emerald-500", column: "border-slate-300 bg-slate-200/70", title: "text-white" };
  if (stage.includes("referral")) return { header: "border-emerald-200 bg-emerald-50", marker: "bg-emerald-600", column: "border-emerald-200 bg-emerald-50/60", title: "text-emerald-950" };
  if (stage.includes("validation") || stage.includes("decision")) return { header: "border-amber-200 bg-amber-50", marker: "bg-amber-500", column: "border-amber-200 bg-amber-50/50", title: "text-amber-950" };
  if (stage.includes("brand-strategy")) return { header: "border-indigo-200 bg-indigo-50", marker: "bg-indigo-600", column: "border-indigo-200 bg-indigo-50/50", title: "text-indigo-950" };
  if (stage.includes("discovery")) return { header: "border-blue-200 bg-blue-50", marker: "bg-blue-600", column: "border-blue-200 bg-blue-50/50", title: "text-blue-950" };
  if (stage.includes("assessment")) return { header: "border-teal-200 bg-teal-50", marker: "bg-teal-600", column: "border-teal-200 bg-teal-50/50", title: "text-teal-950" };
  return { header: "border-slate-200 bg-white", marker: "bg-slate-700", column: "border-slate-200 bg-slate-100/70", title: "text-slate-900" };
}

function CandidateCard({ candidate, dragging, onDragStart, onDragEnd, suppressNavigation }: { candidate: CandidateCRMItem; dragging: boolean; onDragStart: (event: React.DragEvent<HTMLElement>) => void; onDragEnd: () => void; suppressNavigation: boolean }) {
  const momentumTone = candidate.momentum === "accelerating" ? "text-emerald-700" : candidate.momentum === "slowing" ? "text-amber-700" : "text-slate-500";
  return (
    <article draggable data-candidate-id={candidate.id} onDragStart={onDragStart} onDragEnd={onDragEnd} onClickCapture={(event) => { if (suppressNavigation) { event.preventDefault(); event.stopPropagation(); } }} onClick={(event) => { if (!(event.target as HTMLElement).closest("a,button")) window.location.assign(candidate.href); }} className={`group relative cursor-grab rounded-2xl border bg-white p-4 shadow-sm transition duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg ${dragging ? "scale-[0.98] opacity-50 ring-2 ring-blue-400" : ""} ${candidate.referralReady ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200 hover:border-blue-300"}`}>
      <Link draggable={false} href={candidate.href} aria-label={`Open ${candidate.fullName} Candidate 360`} className="pointer-events-none absolute inset-0 rounded-2xl focus:pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <span draggable data-drag-handle aria-hidden="true" title={`Drag ${candidate.fullName} to another stage`} className="absolute right-2 top-2 z-20 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 active:cursor-grabbing"><GripVertical size={15} /></span>
      <div className="flex items-start justify-between gap-3">
        <Link href={candidate.href} className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">{candidate.initials}</span><span className="min-w-0"><span className="block truncate font-black text-slate-900 group-hover:text-blue-700">{candidate.fullName}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{candidate.location || candidate.email}</span></span></Link>
        <ChevronRight size={16} className="mt-2 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2"><span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${attentionClass(candidate.attention)}`}>{candidate.attentionLabel}</span><span className={`inline-flex items-center gap-1 text-[11px] font-bold ${momentumTone}`}>{candidate.momentum === "accelerating" ? <TrendingUp size={13} /> : candidate.momentum === "slowing" ? <TrendingDown size={13} /> : null}{candidate.momentumLabel}</span></div>
      <div className="mt-4"><div className="flex items-center justify-between text-[11px]"><span className="font-bold uppercase tracking-wide text-slate-400">Readiness</span><span className="font-black text-slate-700">{candidate.readinessLabel}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${candidate.referralReady ? "bg-emerald-500" : "bg-teal-500"}`} style={{ width: `${candidate.readiness ?? 0}%` }} /></div></div>
      <div className="relative z-10 mt-4 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Next best action</p><p className="mt-1 min-h-10 text-xs font-semibold leading-5 text-slate-700">{candidate.nextAction}</p>{candidate.actionKind === "lifecycle" ? <div className="mt-3"><CandidateLifecycleAction candidateId={candidate.id} label={candidate.actionLabel} compact /></div> : <Link href={candidate.actionHref} className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${candidate.referralReady ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-900 text-white hover:bg-blue-700"}`}>{candidate.actionLabel}<ArrowRight size={13} /></Link>}</div>
    </article>
  );
}

export function CandidateCRMPage({ state }: { state: CandidateCRMState }) {
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [stage, setStage] = useState("all");
  const [view, setView] = useState<View>("list");
  const topScroll = useRef<HTMLDivElement>(null);
  const boardScroll = useRef<HTMLDivElement>(null);
  const [pipelineWidth, setPipelineWidth] = useState(0);
  const [draggedCandidateId, setDraggedCandidateIdState] = useState<string | null>(null);
  const draggedCandidateIdRef = useRef<string | null>(null);
  const [dropTargetStageId, setDropTargetStageId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [suppressClickCandidateId, setSuppressClickCandidateId] = useState<string | null>(null);
  const [moving, startMove] = useTransition();
  const suppressNavigation = {
    get current() { return suppressClickCandidateId; },
    set current(value: string | null) { setSuppressClickCandidateId(value); },
  };
  const candidates = state.candidates.map((candidate) => {
    const stageId = stageOverrides[candidate.id];
    const target = stageId ? state.stages.find((item) => item.stageId === stageId) : null;
    return target ? { ...candidate, pipelineStageId: target.stageId, pipelineStage: target.stageId, stageLabel: target.label, canonicalLifecycleStage: target.canonicalLifecycleStage } : candidate;
  });
  const setDraggedCandidateId = (value: string | null) => {
    draggedCandidateIdRef.current = value;
    setDraggedCandidateIdState(value);
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesSearch = !normalized || [candidate.fullName, candidate.email, candidate.location].some((value) => value.toLowerCase().includes(normalized));
      const matchesStage = stage === "all" || candidate.pipelineStageId === stage;
      const matchesQuick = quickFilter === "all" ||
        (quickFilter === "active" && candidate.status === "active") ||
        (quickFilter === "attention" && candidate.attention === "needs-attention") ||
        (quickFilter === "referral" && candidate.referralReady);
      return matchesSearch && matchesStage && matchesQuick;
    });
  }, [query, quickFilter, stage, candidates]);
  useEffect(() => {
    if (view === "pipeline" && boardScroll.current) setPipelineWidth(boardScroll.current.scrollWidth);
  }, [view, filtered.length, state.stages.length]);
  const syncScroll = (source: "top" | "board") => {
    const from = source === "top" ? topScroll.current : boardScroll.current;
    const to = source === "top" ? boardScroll.current : topScroll.current;
    if (from && to && Math.abs(to.scrollLeft - from.scrollLeft) > 1) to.scrollLeft = from.scrollLeft;
  };
  const finishDrag = () => {
    setDraggedCandidateId(null);
    setDropTargetStageId(null);
    window.setTimeout(() => setSuppressClickCandidateId(null), 150);
  };
  const dropCandidate = (stageId: string) => {
    const candidateId = draggedCandidateIdRef.current ?? draggedCandidateId;
    setDropTargetStageId(null);
    if (!candidateId) return;
    const target = state.stages.find((item) => item.stageId === stageId);
    const candidate = candidates.find((item) => item.id === candidateId);
    if (!target || !candidate || candidate.pipelineStageId === stageId) { finishDrag(); return; }
    setMoveError(null);
    startMove(async () => {
      const result = await moveCandidateStage(candidateId, stageId);
      if (result.status === "success") {
        setStageOverrides((current) => ({ ...current, [candidateId]: stageId }));
      } else {
        setMoveError(result.message ?? "The candidate could not be moved. Please try again.");
      }
      finishDrag();
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-600"><Sparkles size={14} /> Candidate CRM</div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Candidates</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your candidate pipeline from first contact through franchisor introduction.</p>
        </div>
        <div className="inline-flex self-start rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["list", "pipeline"] as View[]).map((option) => (
            <button key={option} type="button" onClick={() => setView(option)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${view === option ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {option === "list" ? <List size={16} /> : <Columns3 size={16} />}{option}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search candidates</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or location" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
          </label>
          <select aria-label="Filter by pipeline stage" value={stage} onChange={(event) => setStage(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400">
            <option value="all">All stages</option>
            {state.stages.map((item) => <option key={item.stageId} value={item.stageId}>{item.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button key={filter.id} type="button" onClick={() => setQuickFilter(filter.id)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${quickFilter === filter.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{filter.label}</button>
          ))}
          <span className="ml-auto self-center text-xs font-semibold text-slate-500">{filtered.length} candidate{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </section>

      {moveError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{moveError}</div>}
      {moving && <p role="status" className="text-sm font-semibold text-blue-700">Moving candidate…</p>}

      {view === "list" ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Candidate", "Pipeline Stage", "Readiness", "Best Brand", "Last Activity", "Next Action", "Priority", ""].map((label) => <th key={label || "open"} className="border-b border-slate-200 px-4 py-3 font-bold">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((candidate) => (
                  <tr key={candidate.id} className="group hover:bg-blue-50/40">
                    <td className="px-4 py-3"><Link href={candidate.href} className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{candidate.initials}</span><span><span className="block font-bold text-slate-900 group-hover:text-blue-700">{candidate.fullName}</span><span className="block text-xs text-slate-500">{candidate.email} · {candidate.location}</span></span></Link></td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{candidate.stageLabel}</td>
                    <td className="px-4 py-3"><span className="font-bold text-slate-900">{candidate.readinessLabel}</span>{candidate.readiness !== null && <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${candidate.readiness}%` }} /></div>}</td>
                    <td className="px-4 py-3 text-slate-700">{candidate.bestBrand ?? "Not Yet Evaluated"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{candidate.lastActivityLabel}</td>
                    <td className="max-w-[220px] px-4 py-3 font-medium text-slate-700">{candidate.nextAction}</td>
                    <td className="px-4 py-3"><span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${attentionClass(candidate.attention)}`}>{candidate.attentionLabel}</span></td>
                    <td className="px-4 py-3"><Link href={candidate.href} aria-label={`Open ${candidate.fullName}`} className="inline-flex rounded-lg p-2 text-blue-600 hover:bg-blue-100"><ArrowRight size={17} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-12 text-center text-sm text-slate-500">No candidates match these filters.</div>}
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-5 py-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Candidate journey</p><p className="mt-1 text-sm text-slate-500">Follow progress from first contact through franchise award.</p></div><p className="hidden text-xs font-semibold text-slate-400 md:block">Scroll horizontally to explore every stage →</p></div></div>
          <div ref={topScroll} onScroll={() => syncScroll("top")} aria-label="Pipeline top horizontal scroll" className="overflow-x-auto border-b border-slate-200 bg-white px-4 [scrollbar-color:#94a3b8_#e2e8f0] [scrollbar-width:thin]"><div style={{ width: pipelineWidth, height: 12 }} /></div>
          <div ref={boardScroll} onScroll={() => syncScroll("board")} className="overflow-x-auto px-4 py-5 [scrollbar-color:#94a3b8_#e2e8f0] [scrollbar-width:thin]">
          <div className="flex min-w-max gap-4">
            {state.stages.map((column) => {
              const candidates = filtered.filter((candidate) => candidate.pipelineStage === column.stage);
              const presentation = stagePresentation(column.stage);
              const activeTarget = draggedCandidateId !== null && dropTargetStageId === column.stageId;
              return <div key={column.stage} data-pipeline-stage-id={column.stageId} onDragEnter={(event) => { event.preventDefault(); setDropTargetStageId(column.stageId); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTargetStageId(null); }} onDrop={(event) => { event.preventDefault(); dropCandidate(column.stageId); }} className="relative w-72 shrink-0 after:absolute after:-right-4 after:top-7 after:h-px after:w-4 after:bg-slate-300 last:after:hidden"><div className={`mb-3 rounded-xl border px-4 py-3 shadow-sm ${presentation.header}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white ${presentation.marker}`}>{column.sequence + 1}</span><h2 className={`text-sm font-black ${presentation.title}`}>{column.label}</h2></div><span aria-label={`${candidates.length} candidates in ${column.label}`} className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200/70">{candidates.length}</span></div></div><div className={`min-h-[390px] rounded-2xl border p-3 shadow-inner transition ${presentation.column} ${activeTarget ? "border-blue-500 bg-blue-100/70 ring-2 ring-blue-300" : draggedCandidateId ? "border-dashed" : ""}`}><div className="space-y-3">{candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} dragging={draggedCandidateId === candidate.id} suppressNavigation={suppressNavigation.current === candidate.id} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", candidate.id); suppressNavigation.current = candidate.id; setDraggedCandidateId(candidate.id); setMoveError(null); }} onDragEnd={finishDrag} />)}{candidates.length === 0 && <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white ${presentation.marker}`}>{column.sequence + 1}</span><p className="mt-3 text-xs font-bold text-slate-500">{activeTarget ? "Drop candidate here" : "Ready for the next candidate"}</p></div>}</div></div></div>;
            })}
          </div>
          </div>
        </section>
      )}
    </div>
  );
}
