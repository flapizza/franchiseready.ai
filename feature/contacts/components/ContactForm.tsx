"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ContactRecord } from "../models/Contact";
import type { ContactActionState } from "../actions/contact-actions";

const initial: ContactActionState = { status: "idle" };
const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export function ContactForm({ contact, assignees, action }: {
  contact?: ContactRecord;
  assignees: { id: string; name: string }[];
  action: (state: ContactActionState, formData: FormData) => Promise<ContactActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  if (state.status === "success" && state.contactId && !contact) return <section className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-black">Contact created</h1><p className="mt-2 text-slate-600">This person exists independently of any candidate workflow.</p><Link className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white" href={`/crm/contacts/${state.contactId}`}>Open Contact Detail</Link></section>;
  return <form action={formAction} aria-label={contact ? "Edit contact" : "Add contact"} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    {state.status !== "idle" && <div role={state.status === "success" ? "status" : "alert"} className={`rounded-xl border p-3 text-sm font-bold ${state.status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : state.status === "duplicate" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-800"}`}>{state.message}</div>}
    <fieldset><legend className="text-lg font-black">Identity</legend><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field name="firstName" label="First name" required value={contact?.firstName} /><Field name="lastName" label="Last name" required value={contact?.lastName} /><Field name="preferredName" label="Preferred name" value={contact?.preferredName} />
      <Field name="primaryEmail" label="Primary email" type="email" value={contact?.primaryEmail} /><Field name="primaryPhone" label="Primary phone" type="tel" value={contact?.primaryPhone} /><Field name="company" label="Company" value={contact?.company} /><Field name="titleOccupation" label="Title / occupation" value={contact?.titleOccupation} />
    </div></fieldset>
    <fieldset><legend className="text-lg font-black">Location</legend><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field name="addressLine1" label="Address line 1" value={contact?.addressLine1} /><Field name="addressLine2" label="Address line 2" value={contact?.addressLine2} /><Field name="city" label="City" value={contact?.city} /><Field name="stateProvince" label="State / province" value={contact?.stateProvince} /><Field name="postalCode" label="Postal code" value={contact?.postalCode} />
      <label className="text-sm font-bold text-slate-700">Country<select name="country" defaultValue={contact?.country ?? "US"} className={field}><option value="US">United States</option><option value="CA">Canada</option></select></label>
    </div></fieldset>
    <fieldset><legend className="text-lg font-black">Relationship</legend><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field name="source" label="Source" required value={contact?.source ?? "Manual"} />
      <label className="text-sm font-bold text-slate-700">Lifecycle status<select name="lifecycleStatus" defaultValue={contact?.lifecycleStatus ?? "prospect"} className={field}>{[["prospect","Prospect / Marketing Contact"],["engaged","Engaged"],...(contact?.candidate ? [["active-candidate","Active Candidate"]] : []),["nurture","Nurture"],["closed-placed","Closed / Placed"],["historical","Historical"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-bold text-slate-700">Assigned consultant<select name="assignedMembershipId" defaultValue={contact?.assignedMembershipId ?? assignees[0]?.id} className={field}>{assignees.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </div></fieldset>
    <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">Email and phone availability do not establish marketing permission. Marketing eligibility and suppression are tracked separately and remain unchanged by this form.</p>
    <div className="flex flex-wrap justify-end gap-3"><Link href={contact ? `/crm/contacts/${contact.id}` : "/crm/contacts"} className="rounded-xl border px-5 py-3 text-sm font-bold">Cancel</Link><button disabled={pending} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving..." : contact ? "Save Changes" : "Add Contact"}</button></div>
  </form>;
}

function Field({ name, label, required, type="text", value }: { name:string;label:string;required?:boolean;type?:string;value?:string }) { return <label className="text-sm font-bold text-slate-700">{label}{required && <span className="text-red-600"> *</span>}<input className={field} name={name} type={type} required={required} defaultValue={value ?? ""} /></label>; }
