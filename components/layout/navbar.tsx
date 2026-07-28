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
  { label: "Candidates", href: "#candidates" },
  { label: "Consultants", href: "#consultants" },
  { label: "Franchisors", href: "#franchisors" },
  { label: "Resources", href: "#resources" },
  { label: "About", href: "#about" },
];

export function Navbar({
  brand = "FranchiseReady AI",
  items = defaultItems,
  loginHref = "#login",
  primaryHref = "#assessment",
  primaryLabel = "Start Assessment",
}: NavbarProps) {
  return (
    <header className="border-b border-border/80 bg-canvas/90 backdrop-blur">
      <Container className="flex min-h-18 items-center justify-between gap-5 py-3">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2.5 text-base font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground transition-transform group-hover:scale-105">
            F
          </span>
          <span>{brand}</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href={loginHref}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-muted-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:px-4"
          >
            Login
          </Link>
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:px-4"
          >
            <span className="hidden sm:inline">{primaryLabel}</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Container>
    </header>
  );
}
