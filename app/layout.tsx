import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FranGroove AI | Franchise Consultant Operating System",
    template: "%s | FranGroove AI",
  },
  description:
    "AI-powered franchise readiness assessments, intelligent matching, and expert guidance for confident franchise decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
