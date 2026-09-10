"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Send } from "lucide-react";
import { generateAssessmentInvitationAction, type InvitationActionState } from "../actions/candidate-workflow";
import { assessmentSharingState, type AssessmentSharingSession } from "../services/AssessmentSharingState";

const initialState: InvitationActionState = { status: "idle" };

export function AssessmentInvitationAction({ candidateId, existingUrl, session }: { candidateId: string; existingUrl?: string; session?: AssessmentSharingSession }) {
  const [state, action, pending] = useActionState(generateAssessmentInvitationAction, initialState);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const sharing = assessmentSharingState(session);
  const url = sharing.label === "Expired or replaced" ? undefined : (session && state.sessionId && session.id !== state.sessionId ? undefined : state.url) ?? existingUrl;
  const copy = async () => {
    if (!url) return;
    setCopied(false); setCopyError(false);
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
      setCopied(true);
    } catch { setCopyError(true); }
  };
  return <section aria-label="Share assessment controls" className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
    <h2 className="text-xl font-black text-slate-900">Franchise Ownership Assessment</h2>
    <p className="mt-2 font-bold text-slate-900">{url && !session ? "Invitation active" : sharing.label}</p>
    {url && <p className="mt-2 text-sm font-bold">Assessment invitation link ready</p>}
    <p className="mt-2 text-sm text-slate-600">{url ? "Copy the secure link and share it with the candidate. Save your copy before leaving this page; stored links cannot be recovered." : sharing.detail}</p>
    <p className="mt-2 text-sm text-slate-600">This action does not send email. The candidate does not need a FranGroove account.</p>
    {!url && sharing.canGenerate && <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="candidateId" value={candidateId} />
      {sharing.replace && <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p>Replacing the invitation makes the previous link and any unfinished assessment progress unusable. Use your saved link to continue the existing assessment.</p>
        <label className="mt-3 flex items-start gap-2"><input type="checkbox" name="confirmReplacement" value={session?.id} checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} required className="mt-1" />I understand and want to replace the assessment link.</label>
      </div>}
      <button disabled={pending || (sharing.replace && !confirmed)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"><Send size={16} />{pending ? "Generating…" : sharing.replace ? "Replace Assessment Link" : "Generate Assessment Link"}</button>
    </form>}
    {state.status === "error" && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{state.message}</p>}
    {url && sharing.canGenerate && <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy Assessment Link"}</button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white"><ExternalLink size={15} />Open Assessment</a>
    </div>}
    <p role="status" className="mt-3 text-sm font-semibold text-blue-800">{copied ? "Assessment link copied." : ""}</p>
    {copyError && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">Could not copy the link. Use Open Assessment, then copy the address from the new tab.</p>}
    <button type="button" onClick={()=>router.refresh()} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-blue-700">Refresh assessment status</button>
  </section>;
}
