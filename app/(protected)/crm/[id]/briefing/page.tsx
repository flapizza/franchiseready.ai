import { redirect } from "next/navigation";

/** Mission Control briefing and Discovery pre-meeting preparation share one workspace. */
export default async function BriefingPage({ params }: PageProps<"/crm/[id]/briefing">) {
  const { id } = await params;
  redirect(`/crm/${id}/discovery`);
}
