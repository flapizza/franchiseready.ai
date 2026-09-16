import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { InviteCandidateForm } from "@/feature/contacts/components/InviteCandidateForm";

export default async function InviteCandidatePage() {
  const resolution=await resolveWorkspaceComposition();
  if (resolution.status!=="resolved") notFound();
  return <div className="mx-auto max-w-2xl space-y-6">
    <header><Link className="inline-flex min-h-11 items-center font-semibold text-blue-700" href="/crm/contacts">Back to Contacts</Link><h1 className="text-3xl font-black">Invite Candidate</h1><p className="mt-2 text-slate-600">Add a new person and share their assessment. For someone already in FranGroove, start from their existing record.</p></header>
    <InviteCandidateForm />
  </div>;
}
