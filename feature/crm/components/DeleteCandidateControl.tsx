"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCandidateAction, type CandidateDeletionState } from "../actions/candidate-deletion";

const initialState: CandidateDeletionState = { status: "idle" };

export function DeleteCandidateControl({ candidateId }: { candidateId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteCandidateAction, initialState);

  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 size={16} />Delete Candidate</button>;
  }

  return (
    <form action={action} className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <input type="hidden" name="candidateId" value={candidateId} />
      <p className="font-bold text-red-950">Permanently delete this candidate?</p>
      <p className="mt-1 text-sm text-red-800">Deletion succeeds only when no assessment, discovery, assignment, or email records depend on this candidate.</p>
      <label className="mt-4 flex items-start gap-2 text-sm font-semibold text-red-900"><input className="mt-1" type="checkbox" name="confirmed" value="yes" required />I understand this action cannot be undone.</label>
      {state.status === "error" && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{state.message}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" disabled={pending} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{pending ? "Deleting…" : "Confirm Delete"}</button>
        <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60">Cancel</button>
      </div>
    </form>
  );
}
