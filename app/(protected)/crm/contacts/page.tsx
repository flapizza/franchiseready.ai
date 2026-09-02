import { ContactsWorkspace } from "@/feature/contacts/components/ContactsWorkspace";
import type { ContactLifecycleStatus, MarketingPermissionStatus } from "@/feature/contacts/models/Contact";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { notFound } from "next/navigation";

const lifecycle = new Set(["prospect","engaged","active-candidate","nurture","closed-placed","historical"]);
export default async function ContactsPage({ searchParams }: { searchParams:Promise<Record<string,string|string[]|undefined>> }) {
  const params=await searchParams;const string=(key:string)=>typeof params[key]==="string"?(params[key] as string).slice(0,100):"";const q=string("q");const status=lifecycle.has(string("lifecycle"))?string("lifecycle"):"";const filters={tag:string("tag"),list:string("list"),email:string("email"),sms:string("sms"),candidate:string("candidate")};
  let cursor: {updatedAt:string;internalId:string}|undefined;try{if(typeof params.cursor==="string")cursor=JSON.parse(Buffer.from(params.cursor,"base64url").toString("utf8"));}catch{cursor=undefined;}
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();
  const contacts=resolution.composition.dependencies.contacts;const [page,options]=await Promise.all([contacts.list({search:q,lifecycle:status as ContactLifecycleStatus||undefined,tagIds:filters.tag?[filters.tag]:undefined,listId:filters.list||undefined,emailStatus:filters.email as MarketingPermissionStatus||undefined,smsStatus:filters.sms as MarketingPermissionStatus||undefined,candidateStatus:filters.candidate as "candidate"|"not-candidate"||undefined,cursor,limit:25}),contacts.organizationOptions()]);
  return <ContactsWorkspace page={page} search={q} lifecycle={status} options={options} filters={filters}/>;
}
