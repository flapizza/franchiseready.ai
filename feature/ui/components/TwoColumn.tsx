import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  right: ReactNode;
};

export function TwoColumn({
  left,
  right,
}: Props) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">

      <div>
        {left}
      </div>

      <div>
        {right}
      </div>

    </section>
  );
}