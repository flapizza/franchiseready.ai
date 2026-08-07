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
    <div className="flex h-screen overflow-hidden bg-slate-100">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <TopBar />

        <div className="min-h-0 flex-1 overflow-auto">

          {children}

        </div>

      </div>

    </div>
  );
}