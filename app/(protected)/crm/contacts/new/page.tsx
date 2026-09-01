import Link from "next/link";
import { notFound } from "next/navigation";
import { createContactAction } from "@/feature/contacts/actions/contact-actions";
import { ContactForm } from "@/feature/contacts/components/ContactForm";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export default async function AddContactPage(){const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();const assignees=await resolution.composition.dependencies.contacts.listAssignableConsultants();return <div className="mx-auto max-w-5xl space-y-6"><header><Link href="/crm/contacts" className="text-sm font-bold text-slate-500">Back to Contacts</Link><h1 className="mt-4 text-3xl font-black">Add Contact</h1><p className="mt-2 text-sm text-slate-600">Create the permanent person record. Candidate promotion is a separate decision.</p></header><ContactForm action={createContactAction} assignees={assignees}/></div>}
