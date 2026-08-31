import type { PersistedConsultantProfile } from "../models/PersistedConsultantProfile";
import type { OrganizationSettings } from "@/feature/organization-settings/models/OrganizationSettings";

function Field({ label, name, value, type = "text", disabled = false }: { label: string; name: string; value: string | null; type?: string; disabled?: boolean }) {
  return <div><label className="text-sm font-semibold text-slate-600" htmlFor={name}>{label}</label><input id={name} name={name} type={type} disabled={disabled} className="mt-2 w-full rounded-xl border border-slate-300 p-3 disabled:bg-slate-100" defaultValue={value ?? ""} /></div>;
}

export function ProductionConsultantProfileEditor({ profile, settings, canManageOrganization, action }: { profile: PersistedConsultantProfile | null; settings: OrganizationSettings | null; canManageOrganization: boolean; action: (formData: FormData) => Promise<void> }) {
  return <form action={action} className="grid gap-10 xl:grid-cols-[2fr_1fr]">
    <section className="rounded-3xl border bg-white p-8 shadow-sm"><h2 className="text-2xl font-bold">Professional Identity</h2><div className="mt-8 grid gap-6 md:grid-cols-2">
      <Field label="Company" name="organizationDisplayName" value={settings?.displayName ?? null} disabled={!canManageOrganization} />
      <Field label="Consultant" name="displayName" value={profile?.displayName ?? null} />
      <Field label="Title" name="professionalTitle" value={profile?.professionalTitle ?? null} />
      <Field label="Website" name="websiteUrl" value={settings?.websiteUrl ?? null} type="url" disabled={!canManageOrganization} />
      <Field label="Email" name="professionalEmail" value={profile?.professionalEmail ?? null} type="email" />
      <Field label="Phone" name="professionalPhone" value={profile?.professionalPhone ?? null} type="tel" />
      <Field label="LinkedIn" name="linkedInUrl" value={profile?.linkedInUrl ?? null} type="url" />
      <Field label="Scheduling Link" name="schedulingUrl" value={profile?.schedulingUrl ?? null} type="url" />
    </div><button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white" type="submit">Save profile</button></section>
    <aside className="rounded-3xl border bg-slate-950 p-8 text-white"><p className="text-xs uppercase tracking-widest text-blue-300">Brand Preview</p><h2 className="mt-4 text-3xl font-black">{settings?.displayName ?? "Your organization"}</h2><p className="mt-6 leading-7 text-slate-300">{profile?.displayName ?? "Your consultant identity"}</p></aside>
  </form>;
}
