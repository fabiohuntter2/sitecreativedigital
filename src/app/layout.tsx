import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seo.title, template: `%s | Huntter Produções` },
    description: s.seo.description,
    keywords: s.seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    applicationName: s.site.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: s.site.name,
      title: s.seo.title,
      description: s.seo.description,
      url: SITE_URL,
      ...(s.seo.ogImage ? { images: [{ url: s.seo.ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image", title: s.seo.title, description: s.seo.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
