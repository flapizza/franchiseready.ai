import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function WorkspaceLayout({
  children,
}: Props) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
      {children}
    </main>
  );
}