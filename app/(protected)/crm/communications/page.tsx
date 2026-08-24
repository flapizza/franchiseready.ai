import { CommunicationsWorkspacePage } from "@/feature/communications/components/CommunicationsWorkspacePage";
import { CommunicationsWorkspaceRuntime } from "@/feature/communications/runtime/CommunicationsWorkspaceRuntime";
import { ProductionCommunicationsWorkspaceRuntime } from "@/feature/communications/runtime/ProductionCommunicationsWorkspaceRuntime";
import { getPersistenceMode } from "@/lib/env";
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  const input = { filter: value("filter"), query: value("q"), messageId: value("message") };
  const context = getPersistenceMode() === "supabase" ? await resolveAuthenticatedWorkspaceContext() : null;
  const state = context ? await new ProductionCommunicationsWorkspaceRuntime(context).build(input) : await new CommunicationsWorkspaceRuntime().build(input);
  return <CommunicationsWorkspacePage state={state} initialCompose={value("compose") === "1"} initialCandidateId={value("candidate")}
    initialIdempotencyKey={crypto.randomUUID()} initialSubject={value("subject")} initialBody={value("body")}
    initialHandoffId={value("handoff")} initialBrandName={value("brand")} />;
}
