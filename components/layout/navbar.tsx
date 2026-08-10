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
  { label: "Workflow", href: "#workflow" },
  { label: "Features", href: "#features" },
  { label: "Company", href: "#company" },
];

export function Navbar({
  brand = "FranchiseReady AI",
  items = defaultItems,
  loginHref = "#login",
  primaryHref = "/request-demo",
  primaryLabel = "Request Demo",
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-canvas/85 backdrop-blur-xl">
      <Container className="flex min-h-18 items-center justify-between gap-6 py-3">

        <Link
          href="/"
          className="group inline-flex items-center gap-3"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold text-brand-foreground transition-transform duration-200 group-hover:scale-105">
            F
          </span>

          <div>

            <div className="text-base font-bold tracking-tight text-ink">
              {brand}
            </div>

            <div className="text-xs text-muted">
              AI Operating System for Franchise Consultants
            </div>

          </div>

        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href={loginHref}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-muted-surface"
          >
            Login
          </Link>

          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-strong hover:shadow-xl"
          >
            <span className="hidden sm:inline">
              {primaryLabel}
            </span>

            <span className="sm:hidden">
              Demo
            </span>

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </Container>
    </header>
  );
}
