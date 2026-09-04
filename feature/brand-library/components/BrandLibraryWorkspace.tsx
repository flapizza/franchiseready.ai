"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, CircleDollarSign, Database, Search, ShieldCheck } from "lucide-react";
import type { ProfileReadinessState } from "../models/ConsultantBrandIntelligence";
import type { BrandIntelligenceProfile, BrandProfileCompletenessStatus } from "../models/BrandIntelligenceProfile";
import { filterBrandProfiles } from "../runtime/filterBrandProfiles";

const completenessLabels: Record<BrandProfileCompletenessStatus, string> = {
  "sufficiently-populated": "Sufficiently populated", "partially-populated": "Partially populated",
  minimal: "Minimal", "unknown-not-reviewed": "Unknown / not reviewed",
};
const readinessLabels: Record<ProfileReadinessState, string> = {
  "core-intelligence-available": "Core intelligence available",
  "developing-profile": "Developing profile",
  "limited-intelligence": "Limited intelligence",
  "not-reviewed": "Not reviewed",
};
const money = (value: number | null) => value === null ? "Unknown" : value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const label = (value: string) => value.replaceAll("-", " ");

export function BrandLibraryWorkspace({ profiles }: { profiles: BrandIntelligenceProfile[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [ownership, setOwnership] = useState<"" | "owner-operator" | "executive">("");
  const [completeness, setCompleteness] = useState<"" | BrandProfileCompletenessStatus>("");
  const categories = [...new Set(profiles.map((profile) => profile.category.value).filter((value): value is string => Boolean(value)))].sort();
  const filtered = filterBrandProfiles(profiles, { query, category: category || undefined, ownership: ownership || undefined, completeness: completeness || undefined });

  return <main className="space-y-7">
    <header className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.24em] text-teal-300">Consultant intelligence workspace</p><h1 className="mt-3 text-4xl font-black tracking-tight">Brand Intelligence</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Understand how franchise concepts operate, what ownership demands they create, and which facts still require verification before candidate presentation.</p></div>
        <div className="grid grid-cols-2 gap-3"><SummaryStat value={String(profiles.length)} label="Available brands" icon={<Building2 size={18}/>} /><SummaryStat value={String(profiles.reduce((sum, profile) => sum + profile.completeness.verifiedFields, 0))} label="Verified facts" icon={<ShieldCheck size={18}/>} /></div>
      </div>
    </header>

    <section aria-label="Brand library filters" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900"><Search size={17} className="text-teal-600"/>Find the right operating model</div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-bold text-slate-600">Search<input aria-label="Search brands" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, category, or description" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-500"/></label>
        <Filter label="Category" value={category} onChange={setCategory} options={categories.map((value) => [value, value])}/>
        <Filter label="Ownership style" value={ownership} onChange={(value) => setOwnership(value as typeof ownership)} options={[["owner-operator", "Owner-operator"], ["executive", "Executive / manager-run"]]}/>
        <Filter label="Profile completeness" value={completeness} onChange={(value) => setCompleteness(value as typeof completeness)} options={Object.entries(completenessLabels)}/>
      </div>
      <p className="mt-4 text-xs text-slate-500">Showing <strong className="text-slate-900">{filtered.length}</strong> of {profiles.length} brands. Filters describe the current evidence set, not a candidate recommendation.</p>
    </section>

    {filtered.length > 0 ? <section aria-label="Brand profiles" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((profile) => <BrandCard key={profile.id} profile={profile}/>)}</section>
      : <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-black text-slate-900">No profiles match these filters</h2><p className="mt-2 text-sm text-slate-500">Adjust the search or profile filters to return to the available portfolio.</p></section>}
  </main>;
}

function SummaryStat({ value, label: text, icon }: { value: string; label: string; icon: React.ReactNode }) { return <div className="min-w-32 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-teal-300">{icon}</div><p className="mt-3 text-2xl font-black">{value}</p><p className="text-xs text-slate-400">{text}</p></div>; }
function Filter({ label: text, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) { return <label className="text-xs font-bold text-slate-600">{text}<select aria-label={text} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-500"><option value="">All</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }

function BrandCard({ profile }: { profile: BrandIntelligenceProfile }) {
  const investment = profile.economics.initialInvestment.value;
  const ownerStyles = [profile.characteristics.ownerOperatorSuitability.value === "well-suited" ? "Owner-operator" : null, profile.characteristics.executiveSuitability.value === "well-suited" ? "Executive" : null].filter(Boolean);
  return <article aria-label={`${profile.name} brand card`} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg">
    <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-teal-700">{profile.category.value ?? "Category unknown"}</span><span className="text-[10px] font-bold uppercase text-slate-400">{profile.brandStatus}</span></div>
    <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{profile.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{profile.description.value ?? "This profile has not yet been described."}</p>
    <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-xs">
      <div><dt className="flex items-center gap-1 font-bold text-slate-400"><CircleDollarSign size={13}/>Investment</dt><dd className="mt-1 font-black text-slate-800">{investment ? `${money(investment.minimum)}–${money(investment.maximum)}` : "Unknown"}</dd></div>
      <div><dt className="font-bold text-slate-400">Customer model</dt><dd className="mt-1 font-black text-slate-800">{profile.characteristics.customerModel.value ?? "Unknown"}</dd></div>
      <div><dt className="font-bold text-slate-400">Ownership</dt><dd className="mt-1 font-black text-slate-800">{ownerStyles.join(" / ") || "Unknown"}</dd></div>
      <div><dt className="font-bold text-slate-400">Operating model</dt><dd className="mt-1 font-black capitalize text-slate-800">{profile.characteristics.operatingLocations.value?.map(label).join(" / ") ?? "Unknown"}</dd></div>
    </dl>
    <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-3"><Database size={16} className="mt-0.5 shrink-0 text-amber-700"/><div><p className="text-xs font-black text-amber-950">{readinessLabels[profile.consultantIntelligence.readiness.state]}</p><p className="mt-0.5 text-[11px] text-amber-800">{profile.completeness.knownFields} of {profile.completeness.totalFields} core facts known · {profile.completeness.verifiedFields} externally verified</p></div></div>
    <Link href={`/crm/brands/${profile.id}`} aria-label={`Open ${profile.name} Brand Profile`} className="mt-5 inline-flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Open intelligence profile <ArrowRight size={16}/></Link>
  </article>;
}
