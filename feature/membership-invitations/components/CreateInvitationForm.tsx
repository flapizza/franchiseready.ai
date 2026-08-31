"use client";
import { useActionState } from "react";
import { createInvitation, type InvitationActionState } from "../actions/invitation-actions";
const initial: InvitationActionState = { status: "idle", message: "" };
export function CreateInvitationForm({ canInviteAdmin }: { canInviteAdmin: boolean }) {
  const [state, action, pending] = useActionState(createInvitation, initial);
  return <section className="mx-auto max-w-2xl rounded-3xl border bg-white p-8 shadow-sm"><h1 className="text-3xl font-black">Invite a consultant</h1><p className="mt-2 text-slate-600">Create a secure, seven-day invitation to this organization.</p><form action={action} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-bold">Recipient email<input name="email" type="email" required className="rounded-xl border p-3 font-normal" /></label><label className="grid gap-2 text-sm font-bold">Role<select name="role" className="rounded-xl border p-3 font-normal"><option value="consultant">Consultant</option>{canInviteAdmin && <option value="admin">Administrator</option>}</select></label><button disabled={pending} className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white">{pending ? "Creating…" : "Create invitation"}</button></form>{state.message && <p aria-live="polite" className="mt-4 text-sm font-semibold">{state.message}</p>}{state.acceptancePath && <p className="mt-3 break-all rounded-xl bg-slate-100 p-3 text-sm"><span className="font-bold">Acceptance path:</span> {state.acceptancePath}</p>}</section>;
}
