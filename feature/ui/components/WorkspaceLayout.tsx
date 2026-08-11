import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type Props = {
  children: ReactNode;
};

export function WorkspaceLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100">

      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <TopBar />

          <main className="flex-1 overflow-y-auto">

            <div className="mx-auto w-full max-w-7xl p-8">

              {children}

            </div>

          </main>

        </div>

      </div>

    </div>
  );
}