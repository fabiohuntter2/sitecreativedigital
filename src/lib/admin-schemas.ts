import { z } from "zod";

const url = z.string().trim().max(1000).default("");
const slug = z
  .string()
  .trim()
  .min(2, "Informe o endereço (slug)")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens");
const bool = z.coerce.boolean().default(false);
const order = z.coerce.number().int().min(0).max(9999).default(0);

export const schemas = {
  services: z.object({
    title: z.string().trim().min(2).max(120),
    slug,
    short_description: z.string().trim().max(300).default(""),
    description: z.string().trim().max(5000).default(""),
    icon: z.string().max(40).default("sparkles"),
    image_url: url,
    items: z
      .array(z.object({ name: z.string().trim().min(1).max(160), description: z.string().max(400).default(""), price: z.string().max(80).default("") }))
      .max(40)
      .default([]),
    price_label: z.string().max(120).default(""),
    whatsapp_message: z.string().max(600).default(""),
    featured: bool,
    active: bool,
    sort_order: order,
  }),
  portfolio: z.object({
    title: z.string().trim().min(2).max(160),
    slug,
    category: z.enum(["sites", "musicas", "videoclipes", "comerciais", "artes", "ia", "audiovisual"]),
    description: z.string().max(5000).default(""),
    cover_url: url,
    media_type: z.enum(["image", "video", "audio", "youtube", "link"]),
    media_url: url,
    external_url: url,
    gallery: z.array(z.string().max(1000)).max(30).default([]),
    is_example: bool,
    featured: bool,
    published: bool,
    sort_order: order,
  }),
  media: z.object({
    title: z.string().trim().min(2).max(160),
    subtitle: z.string().max(200).default(""),
    kind: z.enum(["audio", "video"]),
    category: z.enum(["musica", "estudio", "videoclipe", "comercial", "ia"]),
    url: z.string().trim().min(1, "Envie o arquivo ou cole o link").max(1000),
    cover_url: url,
    is_example: bool,
    published: bool,
    sort_order: order,
  }),
  testimonials: z.object({
    name: z.string().trim().min(2).max(120),
    role: z.string().max(160).default(""),
    text: z.string().trim().min(5).max(1500),
    avatar_url: url,
    rating: z.coerce.number().int().min(1).max(5).default(5),
    is_example: bool,
    published: bool,
    sort_order: order,
  }),
} as const;

export type EditableTable = keyof typeof schemas;

export const settingsSchema = z.object({
  site: z.object({
    name: z.string().max(160),
    slogan: z.string().max(200),
    logoUrl: z.string().max(1000),
    heroEyebrow: z.string().max(160),
    heroTitle: z.string().max(160),
    heroHighlight: z.string().max(160),
    heroSubtitle: z.string().max(600),
    heroImage: z.string().max(1000),
    aboutTitle: z.string().max(200),
    aboutText: z.string().max(4000),
    aboutImage: z.string().max(1000),
    ctaTitle: z.string().max(200),
    ctaText: z.string().max(400),
    footerText: z.string().max(400),
  }),
  contact: z.object({
    whatsapp: z.string().regex(/^\d{10,15}$/, "WhatsApp: apenas números com DDI e DDD, ex.: 5598999810660"),
    whatsappDisplay: z.string().max(40),
    whatsappMessage: z.string().max(600),
    email: z.union([z.literal(""), z.email("E-mail inválido")]),
    city: z.string().max(120),
    hours: z.string().max(160),
  }),
  social: z.object({
    instagram: z.union([z.literal(""), z.url("Link do Instagram inválido")]),
    facebook: z.union([z.literal(""), z.url("Link do Facebook inválido")]),
    youtube: z.union([z.literal(""), z.url("Link do YouTube inválido")]),
    tiktok: z.union([z.literal(""), z.url("Link do TikTok inválido")]),
  }),
  seo: z.object({
    title: z.string().max(200),
    description: z.string().max(400),
    keywords: z.string().max(1000),
    ogImage: z.string().max(1000),
  }),
});
