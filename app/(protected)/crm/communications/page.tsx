import { CommunicationsWorkspacePage } from "@/feature/communications/components/CommunicationsWorkspacePage";
import { CommunicationsWorkspaceRuntime } from "@/feature/communications/runtime/CommunicationsWorkspaceRuntime";

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  const state = await new CommunicationsWorkspaceRuntime().build({ filter: value("filter"), query: value("q"), messageId: value("message") });
  return <CommunicationsWorkspacePage state={state} />;
}
