import type { ReactNode } from "react";
import { AppShell } from "@/feature/layout/components/AppShell";
import { PageContainer } from "@/feature/layout/components/PageContainer";
import Link from "next/link";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AppShell><PageContainer><nav aria-label="Settings navigation" className="mx-auto mt-6 flex max-w-6xl gap-2 px-6 lg:px-10"><Link href="/settings/profile" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold">Professional Identity</Link><Link href="/settings/pipeline" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold">Pipeline</Link><Link href="/settings/email" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold">Connected Email</Link></nav>{children}</PageContainer></AppShell>;
}
