"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, ExternalLink, Send } from "lucide-react";
import { generateAssessmentInvitationAction, type InvitationActionState } from "../actions/candidate-workflow";
import { assessmentSharingState, type AssessmentSharingSession } from "../services/AssessmentSharingState";

const initialState: InvitationActionState = { status: "idle" };

export function AssessmentInvitationAction({ candidateId, contactId, existingUrl, session, initialInvitation, identityConflict = false }: {
  candidateId?: string; contactId?: string; existingUrl?: string; session?: AssessmentSharingSession;
  initialInvitation?: InvitationActionState; identityConflict?: boolean;
}) {
  const [state, action, pending] = useActionState(generateAssessmentInvitationAction, initialInvitation ?? initialState);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const router = useRouter();
  const effectiveSession = session ?? (state.sessionId && state.expiresAt ? {id:state.sessionId,status:"invited" as const,expiresAt:state.expiresAt,revokedAt:null} : undefined);
  const sharing = assessmentSharingState(effectiveSession);
  const url = identityConflict || !sharing.canGenerate || sharing.label === "Expired or replaced" ? undefined : (session && state.sessionId && session.id !== state.sessionId ? undefined : state.url) ?? existingUrl;
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
    <p className="mt-2 font-bold text-slate-900">{url && !session ? "Invitation ready" : sharing.label}</p>
    {url && <p className="mt-2 text-sm font-bold">Assessment invitation link ready</p>}
    <p className="mt-2 text-sm text-slate-600">{url ? "Copy the secure link and share it with the candidate. Save your copy before leaving this page; stored links cannot be recovered." : sharing.detail}</p>
    <p className="mt-2 text-sm text-slate-600">This action does not send email. The candidate does not need a FranGroove account.</p>
    {identityConflict && <p role="alert" className="mt-3 text-sm font-semibold text-amber-900">These details may match an existing candidate. Review the existing records before continuing. No candidate was created or linked automatically.</p>}
    {!identityConflict && (!url || replaceOpen) && sharing.canGenerate && <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name={contactId ? "contactId" : "candidateId"} value={contactId ?? candidateId} />
      {sharing.replace && <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p>Replacing the invitation makes the previous link and any unfinished assessment progress unusable. Use your saved link to continue the existing assessment.</p>
        <label className="mt-3 flex items-start gap-2"><input type="checkbox" name="confirmReplacement" value={effectiveSession?.id} checked={confirmed === effectiveSession?.id} onChange={event=>setConfirmed(event.target.checked ? effectiveSession?.id ?? null : null)} required className="mt-1" />I understand and want to replace the assessment link.</label>
      </div>}
      <button disabled={pending || (sharing.replace && confirmed !== effectiveSession?.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-50"><Send size={16} />{pending ? "Generating…" : sharing.replace ? "Replace Assessment Link" : "Share Assessment"}</button>
    </form>}
    {state.status === "error" && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{state.message}</p>}
    {url && sharing.canGenerate && <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy Assessment Link"}</button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white"><ExternalLink size={15} />Open Assessment</a>
    </div>}
    {url && sharing.replace && !replaceOpen && <button type="button" onClick={()=>setReplaceOpen(true)} className="mt-3 min-h-11 text-sm font-bold text-blue-700">Replace invitation</button>}
    {candidateId && <div className="mt-3 flex flex-wrap gap-3">
      {contactId && <Link className="min-h-11 py-2 font-bold text-blue-700" href={`/crm/candidates/${candidateId}`}>View Candidate</Link>}
      {effectiveSession?.status === "analyzed" && <Link className="min-h-11 py-2 font-bold text-blue-700" href={`/crm/candidates/${candidateId}#assessment-intelligence`}>View Candidate Intelligence</Link>}
    </div>}
    <p role="status" className="mt-3 text-sm font-semibold text-blue-800">{copied ? "Assessment link copied." : ""}</p>
    {copyError && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">Could not copy the link. Use Open Assessment, then copy the address from the new tab.</p>}
    <button type="button" onClick={()=>router.refresh()} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-blue-700">Refresh assessment status</button>
  </section>;
}
