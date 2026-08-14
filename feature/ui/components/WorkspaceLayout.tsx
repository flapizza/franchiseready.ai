import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function WorkspaceLayout({
  children,
}: Props) {
  return (
    <main className="min-h-0 flex-1 overflow-auto">

      <div className="mx-auto w-full max-w-[1800px] px-8 pb-8 pt-10">

        {children}

      </div>

    </main>
  );
}