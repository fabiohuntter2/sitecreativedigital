import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { ServiceIcon } from "@/components/ui/Icon";
import { ButtonLink, Eyebrow, SectionHeading } from "@/components/ui/Primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { getPortfolio, getService, getServices, getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";
import type { PortfolioCategory } from "@/lib/types";
import { serviceWhatsappMessage, waLink } from "@/lib/whatsapp";

export const revalidate = 300;

/** Relaciona cada serviço às categorias do portfólio para exibir trabalhos relacionados. */
const RELATED: Record<string, PortfolioCategory[]> = {
  "criacao-de-sites": ["sites"],
  "estudio-de-audio": ["musicas"],
  "producao-musical-com-ia": ["ia", "musicas"],
  "redes-sociais-e-marketing": ["artes"],
  "producao-audiovisual": ["videoclipes", "comerciais", "audiovisual"],
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return { title: "Serviço não encontrado" };
  return {
    title: s.title,
    description: s.short_description,
    alternates: { canonical: `/servicos/${s.slug}` },
    openGraph: { title: s.title, description: s.short_description, url: `${SITE_URL}/servicos/${s.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings, services, portfolio] = await Promise.all([getService(slug), getSettings(), getServices(), getPortfolio()]);
  if (!service) notFound();

  const related = portfolio.filter((p) => (RELATED[service.slug] ?? []).includes(p.category)).slice(0, 3);
  const others = services.filter((s) => s.id !== service.id);
  const wa = waLink(settings.contact.whatsapp, serviceWhatsappMessage(service.title, service.whatsapp_message));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Organization", name: settings.site.name, url: SITE_URL },
    areaServed: "BR",
    url: `${SITE_URL}/servicos/${service.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.title,
      itemListElement: service.items.map((it) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: it.name } })),
    },
  };

  return (
    <>
      <section className="grain relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="absolute -left-20 -top-40 h-[520px] w-[620px] rounded-full bg-purple/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Link href="/servicos" className="reveal mb-6 inline-flex items-center gap-2 text-sm text-mute transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Todos os serviços
            </Link>
            <div className="reveal">
              <Eyebrow>Serviço</Eyebrow>
            </div>
            <h1 className="reveal mt-5 flex items-center gap-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple to-green sm:grid">
                <ServiceIcon name={service.icon} className="h-8 w-8" />
              </span>
              {service.title}
            </h1>
            <p className="reveal mt-6 max-w-2xl text-lg leading-relaxed text-mute">{service.description}</p>
            {service.price_label && <p className="reveal mt-4 text-lg font-semibold text-green">{service.price_label}</p>}
            <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={wa} external variant="whatsapp" className="px-7 py-4">
                <WhatsAppIcon /> Orçamento pelo WhatsApp
              </ButtonLink>
              <ButtonLink href={`/orcamento?servico=${service.slug}`} variant="ghost" className="px-7 py-4">
                <FileText className="h-4 w-4" /> Formulário de orçamento
              </ButtonLink>
            </div>
          </div>
          {service.image_url && (
            <div className="reveal relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10">
              <SmartImage src={service.image_url} alt={service.title} fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" aria-labelledby="itens-titulo">
        <SectionHeading align="left" eyebrow="O que fazemos" title={<span id="itens-titulo">Serviços de {service.title.toLowerCase()}</span>} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((it, i) => {
            const msg = `Olá! Conheci o trabalho de vocês pelo site e gostaria de um orçamento de ${it.name} (${service.title}).`;
            return (
              <li key={it.name} className="glow-card glass reveal flex flex-col rounded-2xl p-6" style={{ "--d": `${(i % 6) * 60}ms` } as React.CSSProperties}>
                <span className="spot" aria-hidden="true" />
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green/15">
                    <Check className="h-4 w-4 text-green" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{it.name}</h3>
                    {it.description && <p className="mt-1 text-sm text-mute">{it.description}</p>}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                  <span className="text-sm font-semibold text-white/90">{it.price || "Sob consulta"}</span>
                  <a href={waLink(settings.contact.whatsapp, msg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-green hover:underline">
                    <WhatsAppIcon className="h-4 w-4" /> Pedir orçamento
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" aria-labelledby="rel-titulo">
          <SectionHeading align="left" eyebrow="Portfólio" title={<span id="rel-titulo">Trabalhos relacionados</span>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <PortfolioCard key={p.id} item={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8" aria-labelledby="outros-titulo">
        <h2 id="outros-titulo" className="reveal mb-6 font-display text-2xl font-bold">Outros serviços</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((s) => (
            <li key={s.id} className="reveal">
              <Link href={`/servicos/${s.slug}`} className="glass group flex items-center gap-4 rounded-2xl p-4 transition hover:border-purple/50">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-green">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </span>
                <span className="flex-1 font-semibold">{s.title}</span>
                <ArrowRight className="h-4 w-4 text-mute transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
