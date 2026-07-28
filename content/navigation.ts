import type { NavigationItem } from "@/components/layout/navbar";

export const primaryNavigation: NavigationItem[] = [
  { label: "Candidates", href: "#candidates" },
  { label: "Consultants", href: "#consultants" },
  { label: "Franchisors", href: "#franchisors" },
  { label: "Resources", href: "#resources" },
  { label: "About", href: "#about" },
];

export const footerNavigation = [
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
