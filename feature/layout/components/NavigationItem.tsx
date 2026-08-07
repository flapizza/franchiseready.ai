"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export function NavigationItem({
  href,
  label,
  icon,
}: Props) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
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