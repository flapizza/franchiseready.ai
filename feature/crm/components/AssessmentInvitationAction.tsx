"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Send } from "lucide-react";
import { sendAssessmentInvitationAction, type InvitationActionState } from "../actions/candidate-workflow";

const initialState: InvitationActionState = { status: "idle" };

export function AssessmentInvitationAction({ candidateId, existingUrl }: { candidateId: string; existingUrl?: string }) {
  const [state, action, pending] = useActionState(sendAssessmentInvitationAction, initialState);
  const [copied, setCopied] = useState(false);
  const url = state.url ?? existingUrl;
  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    setCopied(true);
  };
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="font-bold text-slate-900">{url ? "Assessment Invitation Sent" : "Assessment not completed"}</p><p className="mt-1 text-sm text-slate-600">{url ? "The candidate can begin using the secure demo link." : "Invite this candidate to complete the readiness assessment."}</p></div>
        {!url && <form action={action}><input type="hidden" name="candidateId" value={candidateId} /><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><Send size={16} />{pending ? "Sending…" : "Send Assessment"}</button></form>}
      </div>
      {state.status === "error" && <p className="mt-3 text-sm font-semibold text-red-700">{state.message}</p>}
      {url && <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy Assessment Link"}</button><Link href={url} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white"><ExternalLink size={15} />Open Assessment</Link></div>}
    </div>
  );
}
