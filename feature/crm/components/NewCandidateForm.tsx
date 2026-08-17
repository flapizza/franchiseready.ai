"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { createCandidateAction, type CandidateFormState } from "../actions/candidate-workflow";
import { AssessmentInvitationAction } from "./AssessmentInvitationAction";

const initialState: CandidateFormState = { status: "idle" };
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

export function NewCandidateForm() {
  const [state, action, pending] = useActionState(createCandidateAction, initialState);
  if (state.status === "created" && state.candidateId) return <Success state={state} />;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><Link href="/crm/candidates" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Back to Candidates</Link><h1 className="mt-4 text-3xl font-black text-slate-950">New Candidate</h1><p className="mt-2 text-sm text-slate-600">Create a basic record now. Assessment and Candidate Intelligence come next.</p></div>
      {(state.status === "exact-match" || state.status === "possible-match") && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-900">Duplicate review</p><p className="mt-1 text-sm text-amber-800">{state.message}</p>{state.candidateId && <Link href={`/crm/candidates/${state.candidateId}`} className="mt-3 inline-flex font-bold text-blue-700">Open {state.candidateName}</Link>}{state.candidateIds?.map((id) => <Link key={id} href={`/crm/candidates/${id}`} className="mt-3 mr-4 inline-flex font-bold text-blue-700">Review candidate</Link>)}</div>}
      {state.status === "validation-error" && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{state.message}</div>}
      <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2"><Field name="firstName" label="First Name" required /><Field name="lastName" label="Last Name" required /><Field name="email" label="Email" type="email" required /><Field name="phone" label="Phone" /><Field name="city" label="City" /><Field name="state" label="State" /><Field name="preferredTerritory" label="Preferred Territory / Location" /><Field name="leadSource" label="Lead Source" /></div>
        <label className="mt-5 block text-sm font-bold text-slate-700">Notes<textarea name="notes" rows={3} className={fieldClass} placeholder="Optional consultant notes" /></label>
        <div className="mt-6 flex justify-end"><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><UserPlus size={17} />{pending ? "Checking identity…" : "Create Candidate"}</button></div>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="text-sm font-bold text-slate-700">{label}{required && <span className="text-red-500"> *</span>}<input name={name} type={type} required={required} className={fieldClass} /></label>; }
function Success({ state }: { state: CandidateFormState }) { return <div className="mx-auto max-w-2xl space-y-5"><div className="rounded-2xl border border-emerald-200 bg-white p-7 shadow-sm"><CheckCircle2 className="text-emerald-500" size={36} /><h1 className="mt-4 text-2xl font-black text-slate-950">Candidate created</h1><p className="mt-2 text-slate-600">{state.candidateName} is now in your pipeline as a New Candidate.</p><Link href={`/crm/candidates/${state.candidateId}`} className="mt-4 inline-flex font-bold text-blue-700">Open candidate record</Link></div><AssessmentInvitationAction candidateId={state.candidateId!} /></div>; }
