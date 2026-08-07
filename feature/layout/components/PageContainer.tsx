import type { ReactNode } from "react";

type Props = {
  title?: string;

  subtitle?: string;

  children: ReactNode;
};

export function PageContainer({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <main className="flex-1 overflow-auto bg-slate-100">

      {(title || subtitle) && (

        <div className="border-b border-slate-200 bg-white px-10 py-8">

          {title && (

            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {title}
            </h1>

          )}

          {subtitle && (

            <p className="mt-2 max-w-3xl text-lg text-slate-600">
              {subtitle}
            </p>

          )}

        </div>

      )}

      <div className="p-10">

        {children}

      </div>

    </main>
  );
}