"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Mail, MessageSquareReply, RotateCw, Search, Send, UserRound, X } from "lucide-react";
import { retryCandidateEmail, sendCandidateEmail, type EmailActionState } from "../actions/email-actions";
import { createCommunicationFollowUpTask, dismissCommunicationFollowUp, type CommunicationsActionState } from "../actions/communications-actions";
import type { CommunicationsFilter, CommunicationsMessageView, CommunicationsWorkspaceState } from "../models/CommunicationsWorkspaceState";

const emailInitial: EmailActionState = { status: "idle" };
const actionInitial: CommunicationsActionState = { status: "idle" };
const filterLabels: Record<CommunicationsFilter, string> = { all: "All", replied: "Replied", opened: "Opened", clicked: "Clicked", "no-engagement": "No Engagement", "needs-follow-up": "Needs Follow-Up", failed: "Failed Delivery" };

function engagement(message: CommunicationsMessageView): string[] {
  if (message.deliveryStatus === "failed") return ["Delivery failed"];
  const signals = [message.openCount ? `Opened ${message.openCount}×` : "", message.totalClicks ? `Clicked ${message.totalClicks} link${message.totalClicks === 1 ? "" : "s"}` : "", message.replyCount ? "Replied" : ""].filter(Boolean);
  return signals.length ? signals : ["No engagement"];
}

function queryHref(state: CommunicationsWorkspaceState, changes: { filter?: CommunicationsFilter; messageId?: string }): string {
  const params = new URLSearchParams();
  const filter = changes.filter ?? state.filter;
  if (filter !== "all") params.set("filter", filter);
  if (state.query) params.set("q", state.query);
  if (changes.messageId) params.set("message", changes.messageId);
  const query = params.toString();
  return `/crm/communications${query ? `?${query}` : ""}`;
}

export function CommunicationsWorkspacePage({ state, initialCompose = false, initialCandidateId, initialIdempotencyKey = "", initialSubject = "", initialBody = "", initialHandoffId, initialBrandName }: { state: CommunicationsWorkspaceState; initialCompose?: boolean; initialCandidateId?: string; initialIdempotencyKey?: string; initialSubject?: string; initialBody?: string; initialHandoffId?: string; initialBrandName?: string }) {
  const [composing, setComposing] = useState(initialCompose);
  const [replying, setReplying] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(initialIdempotencyKey);
  const [candidateId, setCandidateId] = useState(initialCandidateId ?? state.selected?.candidateId ?? state.candidates[0]?.id ?? "");
  const submitEmail = async (current: EmailActionState, formData: FormData) => {
    if (state.sender.accountId) formData.set("accountId", state.sender.accountId);
    return sendCandidateEmail(current, formData);
  };
  const [sendState, sendAction, sending] = useActionState(submitEmail, emailInitial);
  const [retryState, retryAction, retrying] = useActionState(retryCandidateEmail, emailInitial);
  const [taskState, taskAction, tasking] = useActionState(createCommunicationFollowUpTask, actionInitial);
  const [dismissState, dismissAction, dismissing] = useActionState(dismissCommunicationFollowUp, actionInitial);
  const selectedCandidate = useMemo(() => state.candidates.find((candidate) => candidate.id === candidateId), [candidateId, state.candidates]);
  const openComposer = (reply = false) => {
    setReplying(reply);
    setCandidateId(state.selected?.candidateId ?? state.candidates[0]?.id ?? "");
    setIdempotencyKey(crypto.randomUUID());
    setComposing(true);
  };

  return <main className="space-y-5 p-5 lg:p-7" data-communications-workspace>
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-black uppercase tracking-[.22em] text-teal-600">Consultant communications center</p><h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950">Unified Communications</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Email engagement, replies, delivery issues, and the follow-up decisions tied to each candidate.</p></div>
      <button type="button" onClick={() => openComposer(false)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><Mail size={17} />Compose Email</button>
    </header>

    <section aria-label="Communication filters" className="flex gap-2 overflow-x-auto pb-1">
      {(Object.keys(filterLabels) as CommunicationsFilter[]).map((filter) => <Link key={filter} href={queryHref(state, { filter })} aria-current={state.filter === filter ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${state.filter === filter ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>{filterLabels[filter]} <span className="ml-1 opacity-70">{state.counts[filter]}</span></Link>)}
    </section>

    <form role="search" className="relative max-w-xl" action="/crm/communications"><Search aria-hidden="true" size={17} className="absolute left-4 top-3.5 text-slate-400" /><input type="search" name="q" defaultValue={state.query} aria-label="Search communications" placeholder="Search candidate, subject, sender, or recipient" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" />{state.filter !== "all" && <input type="hidden" name="filter" value={state.filter} />}</form>

    <div className="grid min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.35fr)]">
      <section aria-label="Communication messages" className="border-b border-slate-200 xl:border-b-0 xl:border-r">
        <div className="border-b border-slate-200 px-5 py-4"><h3 className="font-black text-slate-950">{filterLabels[state.filter]}</h3><p className="mt-1 text-xs text-slate-500">{state.messages.length} message{state.messages.length === 1 ? "" : "s"}{state.query ? ` matching “${state.query}”` : ""}</p></div>
        <div className="max-h-[610px] divide-y divide-slate-100 overflow-y-auto">{state.messages.length ? state.messages.map((message) => <Link key={message.messageId} data-message-row={message.messageId} href={queryHref(state, { messageId: message.messageId })} aria-current={state.selected?.messageId === message.messageId ? "true" : undefined} className={`block p-5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-200 ${state.selected?.messageId === message.messageId ? "bg-blue-50" : "hover:bg-slate-50"}`}>
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-950">{message.candidateName}</p><p className="mt-1 truncate text-sm font-bold text-slate-700">{message.subject}</p></div><time className="shrink-0 text-[11px] font-bold text-slate-400">{message.sentLabel ?? "Not sent"}</time></div>
          <div className="mt-3 flex flex-wrap gap-1.5">{engagement(message).map((signal) => <span key={signal} className={`rounded-full px-2.5 py-1 text-[10px] font-black ${signal === "Delivery failed" ? "bg-red-100 text-red-700" : signal === "Replied" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"}`}>{signal}</span>)}{message.needsFollowUp && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">Needs follow-up</span>}</div>
        </Link>) : <div className="p-10 text-center"><p className="font-black text-slate-700">No communications match this view.</p><p className="mt-2 text-sm text-slate-500">Adjust the filter or search to return to active messages.</p></div>}</div>
      </section>

      <section aria-label="Communication detail" className="min-w-0">{state.selected ? <MessageDetail message={state.selected} onCompose={() => openComposer(true)} retryAction={retryAction} retrying={retrying} retryState={retryState} taskAction={taskAction} tasking={tasking} taskState={taskState} dismissAction={dismissAction} dismissing={dismissing} dismissState={dismissState} /> : <div className="grid h-full min-h-72 place-items-center p-8 text-center text-sm text-slate-500">Select a message to review communication intelligence.</div>}</section>
    </div>

    {composing && <div role="dialog" aria-modal="true" aria-label={replying ? "Draft candidate follow-up" : "Compose email"} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><form action={sendAction} className="space-y-4 p-6"><input type="hidden" name="idempotencyKey" value={idempotencyKey} /><input type="hidden" name="handoffId" value={initialHandoffId ?? ""} /><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{initialHandoffId ? "Franchisor introduction" : replying ? "Message-level follow-up" : "New communication"}</p><h3 className="mt-1 text-2xl font-black">{initialHandoffId ? "Review Introduction Draft" : replying ? "Draft follow-up" : "Compose Email"}</h3></div><button type="button" aria-label="Close composer" onClick={() => setComposing(false)} className="rounded-lg p-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><X size={19} /></button></div>
          {initialHandoffId && initialCandidateId && <aside aria-label="Handoff draft context" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm"><p><strong>Candidate Handoff</strong> · {selectedCandidate?.name ?? "Selected candidate"}{initialBrandName ? ` → ${initialBrandName}` : ""} · <span className="font-black text-teal-800">Unsent draft</span></p><Link aria-label="Return to Candidate Handoff Package" href={`/crm/candidates/${initialCandidateId}/referral?referralId=${encodeURIComponent(initialHandoffId)}`} className="font-black text-teal-800 underline-offset-2 hover:underline">Return to package</Link></aside>}
          <label className="block text-xs font-black uppercase text-slate-500">Candidate<select name="candidateId" value={candidateId} onChange={(event) => setCandidateId(event.target.value)} required className="mt-2 w-full rounded-xl border p-3 text-sm font-normal text-slate-900">{state.candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label>
          <dl className="rounded-xl bg-slate-50 p-4 text-sm"><div className="flex gap-3"><dt className="w-14 font-bold text-slate-500">From</dt><dd>{state.sender.name} &lt;{state.sender.email}&gt;</dd></div><div className="mt-2 flex gap-3"><dt className="w-14 font-bold text-slate-500">To</dt><dd>{selectedCandidate?.name} &lt;{selectedCandidate?.email}&gt;</dd></div></dl>
          <label className="block text-xs font-black uppercase text-slate-500">Subject<input name="subject" required defaultValue={replying && state.selected ? `Re: ${state.selected.subject}` : initialSubject} className="mt-2 w-full rounded-xl border p-3 text-sm font-normal text-slate-900" /></label><label className="block text-xs font-black uppercase text-slate-500">Message<textarea name="body" required rows={7} defaultValue={initialBody} className="mt-2 w-full rounded-xl border p-3 text-sm font-normal text-slate-900" /></label><p className="text-xs text-slate-500">Draft only until you choose Send Email. Candidate and handoff context are preserved.</p>{sendState.message && <p role="status" className={`text-sm font-bold ${sendState.status === "error" ? "text-red-700" : "text-teal-700"}`}>{sendState.message}</p>}<div className="flex justify-end gap-3"><button type="button" onClick={() => setComposing(false)} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"><Send size={16} />{sending ? "Sending…" : "Send Email"}</button></div>
        </form></div></div>}
  </main>;
}

function MessageDetail({ message, onCompose, retryAction, retrying, retryState, taskAction, tasking, taskState, dismissAction, dismissing, dismissState }: { message: CommunicationsMessageView; onCompose: () => void; retryAction: (payload: FormData) => void; retrying: boolean; retryState: EmailActionState; taskAction: (payload: FormData) => void; tasking: boolean; taskState: CommunicationsActionState; dismissAction: (payload: FormData) => void; dismissing: boolean; dismissState: CommunicationsActionState }) {
  return <article data-message-detail={message.messageId} className="p-5 lg:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{message.direction === "outbound" ? "Sent message" : "Received message"}</p><h3 className="mt-2 text-2xl font-black text-slate-950">{message.subject}</h3><div className="mt-2 flex flex-wrap gap-4"><Link href={message.candidateHref} className="inline-flex items-center gap-2 text-sm font-black text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><UserRound size={15} />{message.candidateName}</Link><Link href={`${message.candidateHref}/playbook`} className="text-sm font-black text-teal-700">Open Candidate Playbook</Link></div></div><button type="button" onClick={onCompose} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black"><MessageSquareReply size={16} />Draft Follow-Up</button></div>
    <dl className="mt-6 grid gap-2 border-y border-slate-100 py-4 text-sm"><div className="flex gap-3"><dt className="w-16 font-bold text-slate-500">From</dt><dd>{message.from}</dd></div><div className="flex gap-3"><dt className="w-16 font-bold text-slate-500">To</dt><dd>{message.to}</dd></div><div className="flex gap-3"><dt className="w-16 font-bold text-slate-500">Sent</dt><dd>{message.sentLabel ?? "Not sent"}</dd></div></dl>
    <p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{message.body}</p>
    <section aria-label={`Engagement for ${message.subject}`} className="mt-5 rounded-xl border border-slate-200 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h4 className="font-black">Engagement intelligence</h4><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{message.engagementLabel}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Opened" value={`${message.openCount}×`} /><Metric label="Link clicks" value={String(message.totalClicks)} /><Metric label="Replies" value={String(message.replyCount)} /><Metric label="Delivery" value={message.deliveryStatus} /></dl>{message.mostRecentEngagement && <p className="mt-4 text-xs text-slate-600"><strong>Most recent:</strong> {message.mostRecentEngagement}</p>}{message.links.length > 0 && <div aria-label="Tracked links" className="mt-4 space-y-2">{message.links.map((link) => <div key={link.linkId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span className="inline-flex items-center gap-2 font-bold"><ExternalLink size={14} />{link.label}</span><span className="text-xs font-bold text-slate-500">{link.clickCount} click{link.clickCount === 1 ? "" : "s"}</span></div>)}</div>}</section>
    {message.needsFollowUp && <section aria-label="Follow-up recommendation" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5"><h4 className="font-black text-amber-950">Why this needs follow-up</h4><p className="mt-2 text-sm text-amber-900">{message.followUpReason}</p><div className="mt-4 flex flex-wrap gap-2"><form action={taskAction}><input type="hidden" name="candidateId" value={message.candidateId} /><input type="hidden" name="messageId" value={message.messageId} /><input type="hidden" name="reason" value={message.followUpReason} /><button disabled={tasking} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-black text-white">{tasking ? "Creating…" : "Create Task"}</button></form><form action={dismissAction}><input type="hidden" name="candidateId" value={message.candidateId} /><input type="hidden" name="messageId" value={message.messageId} /><button disabled={dismissing} className="rounded-lg border border-amber-300 px-4 py-2 text-xs font-black text-amber-900">Dismiss</button></form></div>{(taskState.message || dismissState.message) && <p role="status" className="mt-3 text-xs font-bold text-amber-950">{taskState.message ?? dismissState.message}</p>}</section>}
    {message.deliveryStatus === "failed" && <form action={retryAction} className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-5"><div><p className="font-black text-red-900">Delivery failed</p><p className="mt-1 text-sm text-red-800">{message.failureReason}</p></div><input type="hidden" name="candidateId" value={message.candidateId} /><input type="hidden" name="messageId" value={message.messageId} /><button disabled={retrying} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white"><RotateCw size={15} />{retrying ? "Retrying…" : "Retry Send"}</button>{retryState.message && <p role="status" className="w-full text-sm font-bold text-red-800">{retryState.message}</p>}</form>}
  </article>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-black capitalize text-slate-900">{value}</dd></div>; }
