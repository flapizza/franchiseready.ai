import Link from "next/link";
import { connection } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductionMembershipInvitationService } from "@/feature/membership-invitations/services/ProductionMembershipInvitationService";
import { AcceptInvitationForm } from "@/feature/membership-invitations/components/AcceptInvitationForm";

const messages = { invalid: "This invitation link is invalid.", expired: "This invitation has expired.", revoked: "This invitation was revoked.", accepted: "This invitation has already been accepted." } as const;
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  await connection(); const { token } = await params; const client = await createServerSupabaseClient();
  const invitation = await new ProductionMembershipInvitationService(client).resolve(token);
  const { data } = await client.auth.getUser();
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><section className="mx-auto max-w-lg rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-black uppercase tracking-widest text-blue-600">FranGroove invitation</p>{invitation.status==="available"?<><h1 className="mt-3 text-3xl font-black">Join {invitation.organizationName}</h1><p className="mt-3 text-slate-600">You have been invited as {invitation.intendedRole === "admin" ? "an administrator" : "a consultant"}.</p>{data.user?<AcceptInvitationForm token={token}/>:<Link className="mt-6 block rounded-xl bg-blue-600 px-5 py-3 text-center font-black text-white" href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}>Sign in to accept</Link>}</>:<><h1 className="mt-3 text-3xl font-black">Invitation unavailable</h1><p className="mt-3 text-slate-600">{messages[invitation.status]}</p></>}</section></main>;
}
