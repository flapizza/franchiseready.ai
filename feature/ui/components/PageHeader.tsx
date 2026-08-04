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
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-xl">

      <div className="grid gap-10 p-8 lg:grid-cols-[1fr_320px] lg:items-center">

        <div className="max-w-4xl">

          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {description}
          </p>

        </div>

        {actions && (
          <div className="flex justify-center lg:justify-end">

            <div className="rounded-[32px] border border-white/20 bg-white p-5 shadow-2xl">
              {actions}
            </div>

          </div>
        )}

      </div>

    </header>
  );
}