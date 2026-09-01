"use client";
import Link from "next/link";
import { useActionState } from "react";
import { promoteContactAction, type ContactActionState } from "../actions/contact-actions";

export function PromoteContact({ contactId, eligible }: { contactId: string; eligible: boolean }) {
  const action = promoteContactAction.bind(null, contactId);
  const [state, submit, pending] = useActionState(action, { status: "idle" } satisfies ContactActionState);
  if (state.candidateId) return <Link href={`/crm/candidates/${state.candidateId}`} className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Open Candidate 360</Link>;
  return <form action={submit}><button disabled={!eligible || pending} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{pending ? "Creating candidate..." : "Promote to Candidate"}</button>{!eligible && <p className="mt-2 text-xs font-semibold text-amber-700">Add an email address before promotion.</p>}{state.message && state.status !== "idle" && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{state.message}</p>}</form>;
}
