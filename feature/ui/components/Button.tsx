import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",

  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",

  danger:
    "bg-red-600 text-white hover:bg-red-700",

  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-700",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold transition-all duration-200",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}