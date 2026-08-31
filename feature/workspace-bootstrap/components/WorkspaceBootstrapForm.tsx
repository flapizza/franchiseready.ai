"use client";

import { useActionState } from "react";
import { bootstrapWorkspace, type BootstrapActionState } from "../actions/bootstrap-workspace";

const initialState: BootstrapActionState = { status: "idle", message: "" };

export function WorkspaceBootstrapForm({ suggestedDisplayName }: { suggestedDisplayName: string }) {
  const [state, action, pending] = useActionState(bootstrapWorkspace, initialState);
  return <form action={action} className="mt-8 grid gap-5">
    <label className="grid gap-2 text-sm font-bold text-slate-700">Organization name<input name="organizationName" required maxLength={200} autoComplete="organization" className="rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" /></label>
    <label className="grid gap-2 text-sm font-bold text-slate-700">Your display name<input name="consultantDisplayName" required maxLength={120} autoComplete="name" defaultValue={suggestedDisplayName} className="rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" /></label>
    <button disabled={pending} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-60">{pending ? "Creating workspace…" : "Create workspace"}</button>
    {state.status === "error" && <p role="alert" className="text-sm font-semibold text-red-700">{state.message}</p>}
  </form>;
}
