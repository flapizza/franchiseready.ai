"use client";

import Link from "next/link";
import { useActionState } from "react";
import { inviteCandidateAction, type InviteCandidateState } from "../actions/contact-actions";
import { AssessmentInvitationAction } from "@/feature/crm/components/AssessmentInvitationAction";

export function InviteCandidateForm() {
  const [state,action,pending] = useActionState(inviteCandidateAction,{status:"idle"} satisfies InviteCandidateState);
  if (state.contactId) return <div className="space-y-5">
    <p role="status" className="font-semibold">{state.message}</p>
    <Link className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 font-bold text-white" href={`/crm/contacts/${state.contactId}#assessment-invitation`}>Open saved Contact</Link>
    {state.invitation?.status === "generated" && <AssessmentInvitationAction contactId={state.contactId} initialInvitation={state.invitation} />}
  </div>;
  return <form action={action} className="space-y-5 rounded-2xl border bg-white p-5 sm:p-8">
    <div className="grid gap-4 sm:grid-cols-2">
      {([['firstName','First name'],['lastName','Last name'],['email','Email'],['phone','Phone (optional)']] as const).map(([name,label])=><label key={name} className="min-w-0 font-semibold">{label}<input className="mt-2 block min-h-11 w-full rounded-lg border px-3 focus-visible:outline-2 focus-visible:outline-blue-600" name={name} type={name==='email'?'email':name==='phone'?'tel':'text'} autoComplete={name==='firstName'?'given-name':name==='lastName'?'family-name':name==='phone'?'tel':'email'} maxLength={name==='email'?320:name==='phone'?40:100} required={name!=='phone'} /></label>)}
    </div>
    <p className="text-sm text-slate-600">We’ll save a Contact and prepare a secure link. Their Candidate record and intelligence become available when they complete the assessment. This does not send email.</p>
    {state.status==='error' && <p role="alert" className="font-semibold text-red-700">{state.message} <Link className="underline" href="/crm/contacts">Review Contacts</Link> · <Link className="underline" href="/crm/candidates">Review Candidates</Link></p>}
    <button disabled={pending} className="min-h-11 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50">{pending?'Preparing invitation…':'Create Contact & Share Assessment'}</button>
  </form>;
}
