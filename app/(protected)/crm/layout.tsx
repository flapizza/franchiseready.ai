import type { ReactNode } from "react";

import { AppShell } from "@/feature/layout/components/AppShell";
import { PageContainer } from "@/feature/layout/components/PageContainer";

type Props = {
  children: ReactNode;
};

export default function CRMLayout({
  children,
}: Props) {
  return (
    <AppShell>
      <PageContainer>
        {children}
      </PageContainer>
    </AppShell>
  );
}