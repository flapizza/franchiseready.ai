import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: Props) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-8 text-white lg:flex-row lg:items-center lg:justify-between">

      <div>

        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-3 text-5xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-blue-100">
          {description}
        </p>

      </div>

      {actions && (
        <div>
          {actions}
        </div>
      )}

    </header>
  );
}