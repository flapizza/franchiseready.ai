import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function SectionCard({
  title,
  children,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}