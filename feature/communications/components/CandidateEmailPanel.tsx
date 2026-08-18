"use client";

import { useActionState, useRef, useState } from "react";
import { ExternalLink, Mail, RotateCw, Send, X } from "lucide-react";
import { retryCandidateEmail, sendCandidateEmail, type EmailActionState } from "../actions/email-actions";
import type { EmailMessageView } from "../runtime/EmailCommunicationRuntime";

const initial: EmailActionState = { status: "idle" };

function engagementSummary(message: EmailMessageView): string {
  if (message.deliveryStatus === "failed") return "Retry available";
  const clicks = message.links.reduce((total, link) => total + link.clickCount, 0);
  const signals = [
    message.openCount ? `Opened ${message.openCount} time${message.openCount === 1 ? "" : "s"}` : "",
    clicks ? `${clicks} link${clicks === 1 ? "" : "s"} clicked` : "",
    message.replyCount ? "Replied" : "",
  ].filter(Boolean);
  return signals.join(" · ") || "No engagement yet";
}

function statusLabel(status: EmailMessageView["deliveryStatus"]): string {
  return status[0].toUpperCase() + status.slice(1);
}

export function CandidateEmailPanel({ candidateId, candidateName, candidateEmail, sender, messages }: {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  sender: { name: string; email: string | null };
  messages: EmailMessageView[];
}) {
  const [composing, setComposing] = useState(false);
  const [key, setKey] = useState("");
  const composeButton = useRef<HTMLButtonElement>(null);
  const submitEmail = async (state: EmailActionState, formData: FormData) => {
    const result = await sendCandidateEmail(state, formData);
    if (result.status === "success") {
      setComposing(false);
      setKey("");
      requestAnimationFrame(() => composeButton.current?.focus());
    }
    return result;
  };
  const [sendState, sendAction, sending] = useActionState(submitEmail, initial);
  const [, retryAction, retrying] = useActionState(retryCandidateEmail, initial);
  const latest = messages[0];
  const closeComposer = () => {
    setComposing(false);
    requestAnimationFrame(() => composeButton.current?.focus());
  };

  return <section aria-labelledby="email-heading" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Communications</p><div className="mt-1 flex flex-wrap items-baseline gap-x-5 gap-y-1"><h2 id="email-heading" className="text-2xl font-black text-slate-900">Email</h2>{latest && <p className="text-sm text-slate-500"><strong className="text-slate-700">Last Email</strong> {latest.sentLabel ?? "Not sent"} <span aria-hidden="true">·</span> <strong className="text-slate-700">Engagement</strong> {engagementSummary(latest)}</p>}</div></div>
      <button ref={composeButton} type="button" aria-expanded={composing} aria-controls="candidate-email-composer" onClick={() => { setKey(crypto.randomUUID()); setComposing(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><Mail size={16} />Compose Email</button>
    </header>

    {composing && <div id="candidate-email-composer" role="region" aria-label={`Compose email to ${candidateName}`} className="border-b border-blue-100 bg-blue-50/40 p-6"><form action={sendAction} className="space-y-4"><input type="hidden" name="candidateId" value={candidateId} /><input type="hidden" name="idempotencyKey" value={key} /><div className="flex justify-between"><h3 className="font-black">New email</h3><button type="button" aria-label="Close compose email" onClick={closeComposer} className="rounded-lg p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"><X size={18} /></button></div>
      <dl className="grid gap-2 rounded-xl bg-white p-4 text-sm"><div className="flex gap-2"><dt className="w-16 font-bold text-slate-500">From</dt><dd>{sender.email ? `${sender.name} <${sender.email}>` : "Email connection required"}</dd></div><div className="flex gap-2"><dt className="w-16 font-bold text-slate-500">To</dt><dd>{candidateName} &lt;{candidateEmail}&gt;</dd></div></dl>
      {!sender.email ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-800">Configure a consultant sending email before composing.</p> : <><label className="block text-xs font-black uppercase text-slate-500">Subject<input name="subject" required className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" /></label><label className="block text-xs font-black uppercase text-slate-500">Message<textarea name="body" required rows={6} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" /></label><p className="text-xs text-slate-500">Open and link tracking are enabled. Conference demo delivery only; no external email will be transmitted.</p><div className="flex justify-end gap-3"><button type="button" onClick={closeComposer} className="rounded-xl border px-4 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Cancel</button><button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50"><Send size={15} />{sending ? "Sending…" : "Send Email"}</button></div></>}{sendState.status === "error" && sendState.message && <p role="status" className="text-sm font-bold text-red-700">{sendState.message}</p>}</form></div>}

    <div aria-label="Email history" className="divide-y divide-slate-100">{messages.length ? messages.map((message) => <article key={message.messageId} data-message-id={message.messageId}><details className="group"><summary className="cursor-pointer list-none px-6 py-5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-200"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black text-slate-900">{message.subject}</p><p className="mt-1 text-xs text-slate-500">Outbound · {message.sentLabel ?? "Not sent"}</p></div><p className={`text-xs font-bold ${message.deliveryStatus === "failed" ? "text-red-700" : "text-teal-700"}`}>{statusLabel(message.deliveryStatus)} · {engagementSummary(message)}</p></div></summary>
      <div className="mx-6 grid gap-4 border-t py-5 lg:grid-cols-2"><div className="space-y-2 text-sm"><h3 className="text-lg font-black text-slate-900">{message.subject}</h3><p><strong>From:</strong> {message.from}</p><p><strong>To:</strong> {message.to}</p><p><strong>Sent:</strong> {message.sentLabel ?? "Not sent"}</p><p><strong>Delivery:</strong> {statusLabel(message.deliveryStatus)}{message.deliveryStatus === "delivered" && message.sentLabel ? ` · ${message.sentLabel}` : ""}</p><p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-700">{message.body}</p>{!message.externallyDelivered && <p className="text-xs text-slate-500">Conference demo delivery only; no external email was transmitted.</p>}</div><div aria-label={`Engagement for ${message.subject}`} className="rounded-xl bg-slate-50 p-4 text-sm"><h4 className="font-black">Engagement</h4><dl className="mt-3 grid grid-cols-2 gap-3"><div><dt className="text-xs text-slate-500">Opened</dt><dd className="font-bold">{message.openCount ? "Yes" : "No"}</dd></div><div><dt className="text-xs text-slate-500">Open Count</dt><dd className="font-bold">{message.openCount}</dd></div>{message.firstOpen && <div><dt className="text-xs text-slate-500">First Open</dt><dd className="font-bold">{message.firstOpen}</dd></div>}{message.lastOpen && <div><dt className="text-xs text-slate-500">Last Open</dt><dd className="font-bold">{message.lastOpen}</dd></div>}</dl>{message.mostRecentEngagement && <p className="mt-3 text-xs"><strong>Most Recent:</strong> {message.mostRecentEngagement}</p>}{message.links.length > 0 && <div className="mt-4 space-y-2">{message.links.map((link) => <div key={link.linkId} className="rounded-lg bg-white p-3"><p className="flex items-center gap-1 font-bold"><ExternalLink size={13} />{link.label}</p><p className="mt-1 text-xs text-slate-500">Click Count: {link.clickCount}{link.lastClick ? ` · Last Click: ${link.lastClick}` : ""}</p></div>)}</div>}{message.replyCount > 0 && <p className="mt-3 font-bold text-teal-700">Candidate replied</p>}{message.nextAction && <p className="mt-3 text-xs font-bold text-blue-700">Suggested: {message.nextAction}</p>}</div></div>
    </details>{message.deliveryStatus === "failed" && <form action={retryAction} className="mx-6 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4"><input type="hidden" name="candidateId" value={candidateId} /><input type="hidden" name="messageId" value={message.messageId} /><p className="text-sm font-bold text-red-800">{message.failureReason}</p><button disabled={retrying} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"><RotateCw size={14} />Retry Send</button></form>}</article>) : <p className="p-8 text-center text-sm text-slate-500">No email history yet.</p>}</div>
  </section>;
}
