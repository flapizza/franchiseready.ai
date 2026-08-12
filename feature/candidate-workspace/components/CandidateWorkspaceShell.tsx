import type { ReactNode } from "react";

type Props = {
  header: ReactNode;
  navigation: ReactNode;
  actionRibbon?: ReactNode;
  children: ReactNode;
};

export function CandidateWorkspaceShell({
  header,
  navigation,
  actionRibbon,
  children,
}: Props) {
  return (
    <div className="space-y-6">

      {header}

      {navigation}

      {actionRibbon}

      <section className="space-y-8">
        {children}
      </section>

    </div>
  );
}