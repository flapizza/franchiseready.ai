"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction, updateTaskAction, type TaskActionState } from "../actions/task-actions";
import type { TaskView } from "../models/TaskWorkspaceState";

const initial: TaskActionState = { status: "idle" };
const inputDate = (value: string) => { const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value)); const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ""; return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`; };

export function TaskForm({ candidates, defaultDueAt, candidateId, task, onDone }: { candidates: Array<{ candidateId: string; name: string }>; defaultDueAt: string; candidateId?: string; task?: TaskView; onDone?: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(task ? updateTaskAction : createTaskAction, initial);
  useEffect(() => { if (state.status === "success") { router.refresh(); onDone?.(); } }, [state.status, router, onDone]);
  return <form action={action} className="space-y-4" aria-label={task ? `Edit ${task.title}` : "Create task"}>
    {task && <input type="hidden" name="taskId" value={task.taskId} />}
    <label className="block text-sm font-bold text-slate-700">Task title<input name="title" required defaultValue={task?.title} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-bold text-slate-700">Candidate<select name="candidateId" defaultValue={task?.candidateId ?? candidateId ?? ""} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"><option value="">No candidate</option>{candidates.map((candidate) => <option key={candidate.candidateId} value={candidate.candidateId}>{candidate.name}</option>)}</select></label>
      <label className="block text-sm font-bold text-slate-700">Priority<select name="priority" defaultValue={task?.priority ?? "normal"} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
    </div>
    <label className="block text-sm font-bold text-slate-700">Due date and time<input name="dueAt" type="datetime-local" required defaultValue={inputDate(task?.dueAt ?? defaultDueAt)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
    <label className="block text-sm font-bold text-slate-700">Notes<textarea name="description" defaultValue={task?.description} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" /></label>
    {state.status === "error" && <p role="alert" className="text-sm font-bold text-red-700">{state.message}</p>}
    <button disabled={pending} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50">{pending ? "Saving…" : task ? "Save Changes" : "Save Task"}</button>
  </form>;
}
