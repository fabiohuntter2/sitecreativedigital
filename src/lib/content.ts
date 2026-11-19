import { cache } from "react";
import seed from "@/data/seed.json";
import { db } from "@/lib/db";
import type { PortfolioItem, Service, Settings, ShowcaseMedia, Testimonial } from "@/lib/types";

const DEFAULT_SETTINGS = seed.settings as Settings;

/** Mescla as configurações salvas com os padrões, garantindo que nenhum campo fique indefinido. */
export function mergeSettings(saved: Partial<Settings> | null | undefined): Settings {
  const s = saved ?? {};
  return {
    site: { ...DEFAULT_SETTINGS.site, ...(s.site ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social ?? {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(s.seo ?? {}) },
  };
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[content] falha ao carregar dados:", err);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<Settings> =>
  safe(async () => mergeSettings(await db().getSettings()), DEFAULT_SETTINGS),
);

export const getServices = cache(async (): Promise<Service[]> =>
  safe(async () => (await db().list("services")).filter((s) => s.active), []),
);

export const getService = cache(async (slug: string): Promise<Service | null> =>
  safe(async () => {
    const s = await db().findBy("services", "slug", slug);
    return s && s.active ? s : null;
  }, null),
);

export const getPortfolio = cache(async (): Promise<PortfolioItem[]> =>
  safe(async () => (await db().list("portfolio")).filter((p) => p.published), []),
);

export const getPortfolioItem = cache(async (slug: string): Promise<PortfolioItem | null> =>
  safe(async () => {
    const p = await db().findBy("portfolio", "slug", slug);
    return p && p.published ? p : null;
  }, null),
);

export const getShowcase = cache(async (): Promise<ShowcaseMedia[]> =>
  safe(async () => (await db().list("media")).filter((m) => m.published), []),
);

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  safe(async () => (await db().list("testimonials")).filter((t) => t.published), []),
);
