"use client";
import { useActionState } from "react";
import { acceptInvitation, type InvitationActionState } from "../actions/invitation-actions";
const initial: InvitationActionState = { status: "idle", message: "" };
export function AcceptInvitationForm({ token }: { token: string }) { const [state,action,pending]=useActionState(acceptInvitation,initial); return <form action={action} className="mt-6"><input type="hidden" name="token" value={token}/><button disabled={pending} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white">{pending?"Joining…":"Accept invitation"}</button>{state.status==="error"&&<p role="alert" className="mt-3 text-sm font-semibold text-red-700">{state.message}</p>}</form>; }
