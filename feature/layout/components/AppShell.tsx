import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type Props = {
  children: ReactNode;
};

export function AppShell({
  children,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-slate-100">

        <TopBar />

        <main className="min-h-0 flex-1 overflow-auto">

          <div className="mx-auto w-full max-w-[1800px] p-8">

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}