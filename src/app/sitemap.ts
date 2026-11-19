import type { MetadataRoute } from "next";
import { getPortfolio, getServices } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, portfolio] = await Promise.all([getServices(), getPortfolio()]);
  const now = new Date();
  const fixed = ["", "/servicos", "/portfolio", "/experimente", "/orcamento", "/sobre", "/contato"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...services.map((s) => ({ url: `${SITE_URL}/servicos/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...portfolio
      .filter((p) => !p.is_example)
      .map((p) => ({ url: `${SITE_URL}/portfolio/${p.slug}`, lastModified: p.created_at ? new Date(p.created_at) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
