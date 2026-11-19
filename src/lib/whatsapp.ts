import { SITE_URL } from "@/lib/constants";
import type { Quote } from "@/lib/types";

export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export function waLink(number: string, text?: string) {
  const n = onlyDigits(number);
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function serviceWhatsappMessage(serviceTitle: string, custom?: string) {
  return (
    custom?.trim() ||
    `Olá! Conheci o trabalho de vocês pelo site e gostaria de solicitar um orçamento de ${serviceTitle}.`
  );
}

/** Mensagem organizada que o cliente envia pelo WhatsApp ao concluir o formulário de orçamento. */
export function buildQuoteMessage(q: Pick<
  Quote,
  "protocol" | "service" | "subservice" | "name" | "phone" | "whatsapp" | "email" | "description" | "deadline" | "budget" | "references" | "attachments"
>) {
  const lines = [
    "*SOLICITAÇÃO DE ORÇAMENTO — SITE*",
    `Protocolo: *${q.protocol}*`,
    "",
    `*Serviço:* ${q.service}${q.subservice ? ` — ${q.subservice}` : ""}`,
    `*Nome:* ${q.name}`,
    `*Telefone:* ${q.phone}`,
  ];
  if (q.whatsapp && q.whatsapp !== q.phone) lines.push(`*WhatsApp:* ${q.whatsapp}`);
  if (q.email) lines.push(`*E-mail:* ${q.email}`);
  if (q.deadline) lines.push(`*Prazo desejado:* ${q.deadline}`);
  if (q.budget) lines.push(`*Investimento previsto:* ${q.budget}`);
  lines.push("", "*Sobre o projeto:*", q.description);
  if (q.references) lines.push("", "*Referências:*", q.references);
  if (q.attachments?.length) {
    lines.push("", "*Arquivos enviados:*");
    q.attachments.forEach((a, i) => lines.push(`${i + 1}. ${a.name}: ${a.url.startsWith("/") ? SITE_URL + a.url : a.url}`));
  }
  return lines.join("\n");
}
