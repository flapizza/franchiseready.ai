import type { ReactNode } from "react";
import { AppShell } from "@/feature/layout/components/AppShell";
import { PageContainer } from "@/feature/layout/components/PageContainer";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AppShell><PageContainer>{children}</PageContainer></AppShell>;
}
