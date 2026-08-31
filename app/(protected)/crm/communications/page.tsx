import { CommunicationsWorkspacePage } from "@/feature/communications/components/CommunicationsWorkspacePage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  const input = { filter: value("filter"), query: value("q"), messageId: value("message") };
  const resolution=await resolveWorkspaceComposition();
  if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Communications"/>;
  const state = "runtimes" in resolution.composition ? await resolution.composition.runtimes.createCommunications().build(input) : await resolution.composition.dependencies.communications.build(input);
  return <CommunicationsWorkspacePage state={state} initialCompose={value("compose") === "1"} initialCandidateId={value("candidate")}
    initialIdempotencyKey={crypto.randomUUID()} initialSubject={value("subject")} initialBody={value("body")}
    initialHandoffId={value("handoff")} initialBrandName={value("brand")} />;
}
