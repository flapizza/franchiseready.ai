import { notFound } from "next/navigation";
import { ContactDetail } from "@/feature/contacts/components/ContactDetail";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
export default async function ContactPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();const repository=resolution.composition.dependencies.contacts;const[contact,options]=await Promise.all([repository.getById(id),repository.organizationOptions()]);if(!contact)notFound();return <ContactDetail contact={contact} options={options}/>}
