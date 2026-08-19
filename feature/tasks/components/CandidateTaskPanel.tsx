"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import type { FollowUpRecommendation } from "../models/ConsultantTask";
import type { TaskView } from "../models/TaskWorkspaceState";
import { acceptRecommendationAction, transitionTaskAction, type TaskActionState } from "../actions/task-actions";
import { TaskForm } from "./TaskForm";

const initial: TaskActionState = { status: "idle" };
function Complete({ task }: { task: TaskView }) { const router = useRouter(); const [state, action, pending] = useActionState(transitionTaskAction, initial); useEffect(() => { if (state.status === "success") router.refresh(); }, [state.status, router]); return <form action={action}><input type="hidden" name="taskId" value={task.taskId} /><input type="hidden" name="expectedCandidateId" value={task.candidateId} /><input type="hidden" name="operation" value="complete" /><button disabled={pending} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">{pending ? "Completing…" : "Complete"}</button>{state.status === "error" && <p role="alert" className="mt-1 text-xs font-bold text-red-700">{state.message}</p>}</form>; }
function Accept({ item }: { item: FollowUpRecommendation }) { const router = useRouter(); const [state, action, pending] = useActionState(acceptRecommendationAction, initial); useEffect(() => { if (state.status === "success") router.refresh(); }, [state.status, router]); return <form action={action}><input type="hidden" name="recommendationId" value={item.recommendationId} /><button disabled={pending} className="rounded-lg border border-indigo-300 px-3 py-2 text-xs font-black text-indigo-700">{pending ? "Creating…" : "Create Task"}</button></form>; }

export function CandidateTaskPanel({ candidateId, candidateName, tasks, recommendations, defaultDueAt }: { candidateId: string; candidateName: string; tasks: TaskView[]; recommendations: FollowUpRecommendation[]; defaultDueAt: string }) {
  const [adding, setAdding] = useState(false); const open = tasks.filter((task) => task.status === "open");
  return <section aria-label="Tasks and follow-up" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Tasks / Follow-Up</p><h2 className="mt-1 text-2xl font-black text-slate-900">What needs to happen next</h2></div><div className="flex gap-2"><button onClick={() => setAdding(!adding)} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white"><Plus size={14} />Add Task</button><Link prefetch={false} href={`/crm/tasks?candidate=${candidateId}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700">Open All Tasks</Link></div></div>
    {adding && <div className="mt-5 rounded-xl bg-slate-50 p-4"><TaskForm candidates={[{ candidateId, name: candidateName }]} candidateId={candidateId} defaultDueAt={defaultDueAt} onDone={() => setAdding(false)} /></div>}
    <div className="mt-5 space-y-3">{open.slice(0, 3).map((task) => <article key={task.taskId} data-task-id={task.taskId} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${task.overdue ? "border-red-200 bg-red-50" : "border-slate-200"}`}><div className="min-w-0 flex-1"><p className="font-black text-slate-900">{task.title}</p><p className={`mt-1 text-xs font-bold ${task.overdue ? "text-red-700" : "text-slate-500"}`}>{task.overdue ? "Overdue · " : ""}{task.dueLabel} · {task.priority}</p></div><Complete task={task} /></article>)}{open.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500"><CheckCircle2 className="mr-2 inline text-emerald-600" size={17} />No open candidate tasks.</p>}</div>
    {recommendations.filter((item) => !item.acceptedTaskId).slice(0, 1).map((item) => <article key={item.recommendationId} className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-black uppercase text-indigo-600">FranGroove recommends</p><p className="mt-1 font-black text-indigo-950">{item.title}</p><p className="mt-1 text-sm text-indigo-800">{item.reason}</p><div className="mt-3"><Accept item={item} /></div></article>)}
  </section>;
}
