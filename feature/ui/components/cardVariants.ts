import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "overflow-hidden rounded-2xl border shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white",

        elevated:
          "border-slate-200 bg-white shadow-lg",

        primary:
          "border-blue-200 bg-blue-50",

        success:
          "border-emerald-200 bg-emerald-50",

        warning:
          "border-amber-200 bg-amber-50",

        danger:
          "border-red-200 bg-red-50",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  },
);