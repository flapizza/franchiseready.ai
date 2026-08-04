import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { cardVariants } from "./cardVariants";

type Props =
  HTMLAttributes<HTMLElement> &
  VariantProps<typeof cardVariants> & {
    title?: string;
    subtitle?: string;
    children: ReactNode;
  };

export function Card({
  title,
  subtitle,
  children,
  className,
  variant,
  ...props
}: Props) {
  return (
    <section
      {...props}
      className={cn(
        cardVariants({
          variant,
        }),
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="border-b border-slate-100 px-6 py-5">

          {title && (
            <h2 className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}

        </header>
      )}

      <div className="p-6">
        {children}
      </div>

    </section>
  );
}