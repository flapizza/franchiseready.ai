import type { ReactNode } from "react";

import { AppShell } from "@/feature/layout/components/AppShell";
import { PageContainer } from "@/feature/layout/components/PageContainer";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

type Props = {
  children: ReactNode;
};

export default async function CRMLayout({
  children,
}: Props) {
  await connection();
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status === "needs-workspace-bootstrap") redirect("/onboarding");
  if (resolution.status !== "resolved") notFound();
  return (
    <AppShell presentation={resolution.composition.presentation}>
      <PageContainer>
        {children}
      </PageContainer>
    </AppShell>
  );
}
