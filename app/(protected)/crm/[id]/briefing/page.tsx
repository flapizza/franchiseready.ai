import { ConsultantBriefingPage } from "@/feature/consultant-briefing/components/ConsultantBriefingPage";
import { ConsultantBriefingRuntime } from "@/feature/consultant-briefing/runtime/ConsultantBriefingRuntime";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BriefingPage({
  params,
}: Props) {
  await params;

  const runtime = new ConsultantBriefingRuntime();

  const briefing = runtime.build();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <ConsultantBriefingPage briefing={briefing} />
    </main>
  );
}