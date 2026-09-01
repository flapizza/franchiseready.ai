"use client";

export default function ContactsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm" role="alert">
    <p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Contacts unavailable</p>
    <h1 className="mt-2 text-2xl font-black">We could not load the Contacts workspace.</h1>
    <p className="mt-2 text-slate-600">Your data was not changed. Try loading the workspace again.</p>
    <button className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white" onClick={reset}>Try again</button>
  </section>;
}
