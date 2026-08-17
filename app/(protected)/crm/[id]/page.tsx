import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyCandidatePage({ params }: Props) {
  const { id } = await params;
  redirect(`/crm/candidates/${id}`);
}
