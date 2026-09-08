import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 metadataBase: new URL("https://frangroove.com"),
 title: "FranGroove AI | Built for Franchise Consultants",
 description: "Explore FranGroove: candidate CRM, Discovery workflows, and the vision for an intelligent franchise consulting workspace. Controlled rollout is underway.",
 robots: { index: true, follow: true },
};
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en" data-scroll-behavior="smooth"><body className="min-h-full font-sans">{children}</body></html>;
}
