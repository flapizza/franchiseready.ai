"use client";

export default function BrandsError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm" role="alert">
    <p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Brand Intelligence unavailable</p>
    <h1 className="mt-2 text-2xl font-black">We could not load Brand Intelligence.</h1>
    <p className="mt-2 text-slate-600">Try loading the workspace again.</p>
    <button className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={unstable_retry}>Try again</button>
  </section>;
}
