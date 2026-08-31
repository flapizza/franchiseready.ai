import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

const notices: Record<string, string> = {
  denied: "Google connection was cancelled. Nothing was connected.",
  failed: "Google could not be connected. Please try again.",
  "invalid-state": "That Google connection request expired or was already used. Please start again.",
  "session-required": "Sign in again before connecting Google.",
  disconnected: "Google account disconnected. Existing communication history was preserved.",
  "disconnect-failed": "The Google account could not be disconnected. Please try again.",
};

export default async function ConnectedEmailSettingsPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const result = (await searchParams).google;
  const resolution=await resolveWorkspaceComposition();
  if (resolution.status!=="resolved" || "runtimes" in resolution.composition) {
    return <main className="mx-auto max-w-6xl p-10"><Header /><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Demo workspace</p><h2 className="mt-2 text-xl font-black text-slate-900">Google connection is not required</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">This workspace uses deterministic demo communications. Connect a Google account from an authenticated production workspace.</p></section></main>;
  }
  const accounts = await resolution.composition.dependencies.emailAccountSummaries();
  return <main className="mx-auto max-w-6xl p-10"><Header />
    {result && notices[result] && <p role="status" className="mb-5 rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-900">{notices[result]}</p>}
    <div className="space-y-4">{accounts.map((account) => <section key={account.publicId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">{account.status === "connected" ? "Connected" : account.status.replace("-", " ")}</p><h2 className="mt-2 text-xl font-black text-slate-950">{account.displayName || "Google account"}</h2><p className="mt-1 text-sm text-slate-600">{account.emailAddress}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">Google Workspace / Gmail</span></div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Available capability</dt><dd className="mt-1 font-bold text-slate-900">{account.capabilities.join(", ") || "Reconnect required"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Connected</dt><dd className="mt-1 font-bold text-slate-900">{account.connectedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(account.connectedAt)) : "Not available"}</dd></div></dl>
      {account.status === "connected" && <form action="/auth/google/disconnect" method="post" className="mt-5"><input type="hidden" name="accountId" value={account.publicId} /><button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50">Disconnect</button></form>}
    </section>)}
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">{accounts.length ? "Another account" : "Not connected"}</p><h2 className="mt-2 text-xl font-black text-slate-950">Connect Google Account</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">Allow FranGroove to identify your account and prepare to send email only when you explicitly choose Send. FranGroove does not request permission to read your mailbox in this release.</p><form action="/auth/google/connect" method="post" className="mt-5"><input type="hidden" name="returnTo" value="/settings/email?google=connected" /><button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800">Connect Google Account</button></form></section>
    </div></main>;
}

function Header() {
  return <div className="mb-8"><p className="text-xs font-black uppercase tracking-[.22em] text-blue-600">Settings</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Connected Email</h1><p className="mt-3 max-w-3xl text-slate-600">Connect the Google account you control for consultant email. Mailbox access stays private to you.</p></div>;
}
