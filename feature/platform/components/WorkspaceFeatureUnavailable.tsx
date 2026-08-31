export function WorkspaceFeatureUnavailable({ title, detail }: { title: string; detail?: string }) {
  return <section role="status" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Not available in this workspace</p>
    <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
    <p className="mt-2 max-w-2xl text-sm text-slate-600">{detail ?? "This capability does not yet have a production-backed implementation. No demo data has been substituted."}</p>
  </section>;
}
