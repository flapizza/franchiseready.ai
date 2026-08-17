"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exactMatch?: boolean;
  activeSuffixes?: string[];
  excludedSuffixes?: string[];
};

export function NavigationItem({
  href,
  label,
  icon,
  exactMatch = false,
  activeSuffixes = [],
  excludedSuffixes = [],
}: Props) {
  const pathname = usePathname();

  const excluded = excludedSuffixes.some((suffix) => pathname.endsWith(suffix));
  const active = activeSuffixes.some((suffix) => pathname.endsWith(suffix)) ||
    (!excluded && (pathname === href || (!exactMatch && pathname.startsWith(`${href}/`))));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
        active
          ? "bg-blue-600 text-white shadow-lg"
          : "text-slate-400 hover:bg-slate-800 hover:text-white",
      ].join(" ")}
    >
      <span className="text-lg">
        {icon}
      </span>

      <span className="font-medium">
        {label}
      </span>
    </Link>
  );
}
