import type { PortfolioCategory, QuoteStatus, ShowcaseCategory } from "@/lib/types";

// Endereço público: variável própria > domínio de produção informado pela Vercel > localhost
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const PORTFOLIO_CATEGORIES: { value: PortfolioCategory; label: string }[] = [
  { value: "sites", label: "Sites" },
  { value: "musicas", label: "Músicas" },
  { value: "videoclipes", label: "Videoclipes" },
  { value: "comerciais", label: "Comerciais" },
  { value: "artes", label: "Artes e flyers" },
  { value: "ia", label: "Projetos com IA" },
  { value: "audiovisual", label: "Produções audiovisuais" },
];

export const SHOWCASE_CATEGORIES: { value: ShowcaseCategory; label: string }[] = [
  { value: "musica", label: "Músicas" },
  { value: "estudio", label: "Produções do estúdio" },
  { value: "videoclipe", label: "Videoclipes" },
  { value: "comercial", label: "Comerciais" },
  { value: "ia", label: "Inteligência artificial" },
];

export const QUOTE_STATUS: { value: QuoteStatus; label: string; color: string }[] = [
  { value: "novo", label: "Novo", color: "bg-green/15 text-green" },
  { value: "em_andamento", label: "Em andamento", color: "bg-purple/20 text-purple-soft" },
  { value: "respondido", label: "Respondido", color: "bg-white/10 text-white" },
  { value: "arquivado", label: "Arquivado", color: "bg-white/5 text-mute" },
];

export const SERVICE_ICONS = [
  "code",
  "mic",
  "sparkles",
  "megaphone",
  "file-badge",
  "clapperboard",
  "music",
  "camera",
  "monitor-play",
  "palette",
  "radio",
  "headphones",
] as const;

export const portfolioLabel = (v: string) => PORTFOLIO_CATEGORIES.find((c) => c.value === v)?.label ?? v;
export const showcaseLabel = (v: string) => SHOWCASE_CATEGORIES.find((c) => c.value === v)?.label ?? v;
