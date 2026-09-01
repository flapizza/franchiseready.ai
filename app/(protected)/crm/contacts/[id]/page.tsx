import { notFound } from "next/navigation";
import { ContactDetail } from "@/feature/contacts/components/ContactDetail";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
export default async function ContactPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();const contact=await resolution.composition.dependencies.contacts.getById(id);if(!contact)notFound();return <ContactDetail contact={contact}/>}
