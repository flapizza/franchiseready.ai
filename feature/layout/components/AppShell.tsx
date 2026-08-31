import type { ReactNode } from "react";
import type { WorkspacePresentation } from "../models/WorkspacePresentation";

import { DemoWorkspaceIndicator } from "./DemoWorkspaceIndicator";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type Props = {
  children: ReactNode;
  presentation: WorkspacePresentation;
};

export function AppShell({
  children,
  presentation,
}: Props) {
  return (
    <div data-app-shell className="flex h-dvh min-h-0 overflow-hidden bg-slate-100">

      <Sidebar presentation={presentation} />

      <div data-workspace-column className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-slate-100">

        {presentation.temporaryDataIndicator && <DemoWorkspaceIndicator indicator={presentation.temporaryDataIndicator} />}

        <TopBar presentation={presentation} />

        <main data-workspace-scroll className="min-h-0 flex-1 overflow-auto bg-slate-100">

          <div data-workspace-frame className="mx-auto flex min-h-full w-full max-w-[1800px] flex-col bg-slate-100 p-8">

            {children}

          </div>

        </main>

      </div>

    </div>
  );
}
