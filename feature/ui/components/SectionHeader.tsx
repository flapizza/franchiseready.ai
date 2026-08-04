import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="mb-6 flex items-start justify-between">

      <div>

        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-2 text-2xl font-bold">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-slate-500">
            {description}
          </p>
        )}

      </div>

      {action}

    </div>
  );
}