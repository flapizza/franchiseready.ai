"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { advanceCandidateLifecycleAction, type LifecycleActionState } from "../actions/candidate-lifecycle";

const initialState: LifecycleActionState = { status: "idle" };

export function CandidateLifecycleAction({ candidateId, label, compact = false }: { candidateId: string; label: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(advanceCandidateLifecycleAction, initialState);
  return <form action={action} className="w-full"><input type="hidden" name="candidateId" value={candidateId} /><button disabled={pending} className={`inline-flex items-center justify-center gap-2 bg-blue-600 font-black text-white transition hover:bg-blue-700 disabled:opacity-60 ${compact ? "w-full rounded-lg px-3 py-2 text-xs" : "rounded-xl px-4 py-2.5 text-sm"}`}>{pending ? "Updating…" : label}<ArrowRight size={compact ? 13 : 16} /></button>{state.status !== "idle" && state.status !== "success" && <p className="mt-2 text-xs font-semibold text-amber-700">{state.message}</p>}</form>;
}
