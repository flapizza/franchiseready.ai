import { redirect, notFound } from "next/navigation";
import { connection } from "next/server";
import { WorkspaceBootstrapForm } from "@/feature/workspace-bootstrap/components/WorkspaceBootstrapForm";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function WorkspaceBootstrapPage() {
  await connection();
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status === "resolved") redirect("/crm");
  if (resolution.status !== "needs-workspace-bootstrap") notFound();
  const emailName = resolution.identity.email?.split("@")[0] ?? "";
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"><p className="text-sm font-black uppercase tracking-widest text-blue-600">FranGroove workspace</p><h1 className="mt-3 text-3xl font-black text-slate-950">Create your organization</h1><p className="mt-3 text-slate-600">Set up your first production workspace. You can refine your professional profile afterward.</p><WorkspaceBootstrapForm suggestedDisplayName={emailName} /></section></main>;
}
