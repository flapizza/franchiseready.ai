import { notFound } from "next/navigation";

import { AssessmentPlayer } from "@/feature/assessment-engine/components/AssessmentPlayer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentPage({
  params,
}: Props) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <AssessmentPlayer assessmentId={id} />
    </main>
  );
}