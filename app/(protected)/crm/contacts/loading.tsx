export default function ContactsLoading() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading contacts">
    <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
    <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
    <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
  </div>;
}
