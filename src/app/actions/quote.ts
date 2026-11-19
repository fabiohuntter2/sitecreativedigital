"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServices, getSettings } from "@/lib/content";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { buildQuoteMessage, onlyDigits, waLink } from "@/lib/whatsapp";

const attachment = z.object({
  name: z.string().max(200),
  url: z
    .string()
    .max(600)
    .refine((u) => u.startsWith("/media/orcamentos/") || /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\/orcamentos\//.test(u), "Arquivo inválido"),
  size: z.number().nonnegative(),
  type: z.string().max(120),
});

const schema = z.object({
  service: z.string().min(1, "Escolha um serviço").max(120),
  subservice: z.string().max(160).optional().default(""),
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  phone: z.string().trim().refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13, "Telefone inválido (inclua o DDD)"),
  whatsapp: z.string().trim().optional().default("").refine((v) => !v || (onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13), "WhatsApp inválido"),
  email: z.union([z.literal(""), z.email("E-mail inválido")]).optional().default(""),
  description: z.string().trim().min(10, "Descreva o projeto (mínimo 10 caracteres)").max(3000),
  deadline: z.string().max(80).optional().default(""),
  budget: z.string().max(80).optional().default(""),
  references: z.string().max(1500).optional().default(""),
  attachments: z.array(attachment).max(5).default([]),
  website: z.string().max(0).optional().default(""), // honeypot anti-spam
  consent: z.literal(true, { error: "É necessário autorizar o contato" }),
});

export type QuoteInput = z.input<typeof schema>;
export type QuoteResult =
  | { ok: true; protocol: string; whatsappUrl: string; message: string }
  | { ok: false; error: string; fields?: Record<string, string> };

function protocol() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `HP-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function submitQuote(input: QuoteInput): Promise<QuoteResult> {
  const ip = await clientIp(headers());
  if (!rateLimit(`quote:${ip}`, 5, 10 * 60_000).ok) {
    return { ok: false, error: "Muitas solicitações em sequência. Aguarde alguns minutos ou fale conosco direto pelo WhatsApp." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Confira os campos destacados.", fields };
  }
  const data = parsed.data;

  const services = await getServices();
  if (!services.some((s) => s.title === data.service) && data.service !== "Outro") {
    return { ok: false, error: "Serviço inválido.", fields: { service: "Escolha um serviço da lista" } };
  }

  const quote = {
    protocol: protocol(),
    service: data.service,
    subservice: data.subservice,
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp || data.phone,
    email: data.email,
    description: data.description,
    deadline: data.deadline,
    budget: data.budget,
    references: data.references,
    attachments: data.attachments,
    status: "novo" as const,
    notes: "",
  };

  try {
    await db().insert("quotes", quote);
  } catch (err) {
    console.error("[orcamento] falha ao salvar:", err);
    // Mesmo se o banco falhar, o cliente ainda consegue enviar pelo WhatsApp.
  }

  const settings = await getSettings();
  const message = buildQuoteMessage(quote);
  return { ok: true, protocol: quote.protocol, message, whatsappUrl: waLink(settings.contact.whatsapp, message) };
}
