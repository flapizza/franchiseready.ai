import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";

export type NavigationItem = {
  href: string;
  label: string;
};

type NavbarProps = {
  brand?: string;
  items?: NavigationItem[];
  loginHref?: string;
  primaryHref?: string;
  primaryLabel?: string;
};

const defaultItems: NavigationItem[] = [
  { label: "Platform", href: "#platform" },
  { label: "AI Modules", href: "#modules" },
  { label: "Why FranGroove", href: "#why" },
  { label: "Resources", href: "#resources" },
];

export function Navbar({
  brand = "FranGroove AI",
  items = defaultItems,
  loginHref = "#login",
  primaryHref = "/request-demo",
  primaryLabel = "Book Demo",
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">

      <Container className="flex min-h-20 items-center justify-between gap-8 py-3">

        <Link
          href="/"
          className="group inline-flex items-center gap-4"
        >

          <div className="relative">

            <div className="absolute inset-0 rounded-2xl bg-teal-400/25 blur-lg transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl ring-1 ring-teal-500/25">

              <span className="text-2xl font-black tracking-tight text-teal-400">
                G
              </span>

            </div>

          </div>

          <div>

            <div className="text-xl font-black tracking-tight text-slate-900">

              Fran
              <span className="text-teal-500">
                Groove
              </span>{" "}
              AI

            </div>

            <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              The AI Operating System
            </div>

          </div>

        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-10 lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-teal-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href={loginHref}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Login
          </Link>

          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl"
          >
            <span className="hidden sm:inline">
              {primaryLabel}
            </span>

            <span className="sm:hidden">
              Demo
            </span>

            <ArrowRight className="h-4 w-4 text-teal-400" />
          </Link>

        </div>

      </Container>

    </header>
  );
}
