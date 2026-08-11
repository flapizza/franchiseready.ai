import { Candidate360Page } from "@/feature/candidate-360/components/Candidate360Page";

type Props = {
  params: Promise<{
    candidateId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { candidateId } = await params;

  return (
    <Candidate360Page
      candidateId={candidateId}
    />
  );
}