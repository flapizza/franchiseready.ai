import { ContactsWorkspace } from "@/feature/contacts/components/ContactsWorkspace";
import type { ContactLifecycleStatus } from "@/feature/contacts/models/Contact";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { notFound } from "next/navigation";

const lifecycle = new Set(["prospect","engaged","active-candidate","nurture","closed-placed","historical"]);
export default async function ContactsPage({ searchParams }: { searchParams:Promise<Record<string,string|string[]|undefined>> }) {
  const params=await searchParams;const q=typeof params.q==="string"?params.q.slice(0,100):"";const status=typeof params.lifecycle==="string"&&lifecycle.has(params.lifecycle)?params.lifecycle:"";
  let cursor: {updatedAt:string;internalId:string}|undefined;try{if(typeof params.cursor==="string")cursor=JSON.parse(Buffer.from(params.cursor,"base64url").toString("utf8"));}catch{cursor=undefined;}
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();
  const page=await resolution.composition.dependencies.contacts.list({search:q,lifecycle:status as ContactLifecycleStatus||undefined,cursor,limit:25});
  return <ContactsWorkspace page={page} search={q} lifecycle={status}/>;
}
