import Link from "next/link";

export function DemoCandidateJourney({ candidateId }: { candidateId: string }) {
  const steps = [
    ["Assessment Intelligence", `/crm/candidates/${candidateId}#assessment-intelligence`],
    ["Discovery", `/crm/${candidateId}/discovery`],
    ["Brand Strategy", `/crm/candidates/${candidateId}/strategy`],
    ["Brand Presentation", `/crm/candidates/${candidateId}/strategy/presentation`],
    ["Referral Studio", `/crm/candidates/${candidateId}/referral`],
  ] as const;

  return <nav aria-label="Candidate story" className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">IFPG candidate story</p>
    <p className="mt-1 text-sm text-slate-600">Follow this candidate from assessment intelligence through franchisor referral.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {steps.map(([label, href], index) => <Link key={label} href={href} className={index === 0 ? "rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white" : "rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-black text-blue-800"}>{index + 1}. {label}</Link>)}
    </div>
  </nav>;
}
