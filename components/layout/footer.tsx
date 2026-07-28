import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { NavigationItem } from "@/components/layout/navbar";

type FooterGroup = {
  title: string;
  links: NavigationItem[];
};

type FooterProps = {
  brand?: string;
  groups?: FooterGroup[];
};

const defaultGroups: FooterGroup[] = [
  {
    title: "Platform",
    links: [
      { label: "For Candidates", href: "#candidates" },
      { label: "For Consultants", href: "#consultants" },
      { label: "For Franchisors", href: "#franchisors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Resources", href: "#resources" },
      { label: "Contact", href: "mailto:hello@franchiseready.ai" },
    ],
  },
];

export function Footer({ brand = "FranchiseReady AI", groups = defaultGroups }: FooterProps) {
  return (
    <footer className="border-t border-border bg-ink text-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">F</span>
              {brand}
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/65">
              The intelligent starting point for every franchise journey.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-white">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#privacy" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Privacy</Link>
            <Link href="#terms" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Terms</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
