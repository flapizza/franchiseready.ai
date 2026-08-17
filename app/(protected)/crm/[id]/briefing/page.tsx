import { ConsultantBriefingPage } from "@/feature/consultant-briefing/components/ConsultantBriefingPage";
import { ConsultantBriefingRuntime } from "@/feature/consultant-briefing/runtime/ConsultantBriefingRuntime";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BriefingPage({
  params,
}: Props) {
  const { id } = await params;

  const runtime = new ConsultantBriefingRuntime();

  const briefing = await runtime.build(id);

  if (!briefing) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl p-8">
      <ConsultantBriefingPage briefing={briefing} />
    </main>
  );
}
