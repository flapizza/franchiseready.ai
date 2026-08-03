import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}

        </div>

        {action && (
          <div>
            {action}
          </div>
        )}

      </header>

      <div className="p-6">
        {children}
      </div>

    </section>
  );
}