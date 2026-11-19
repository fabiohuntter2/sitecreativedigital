import { ArrowRight, Headphones, MessageSquareQuote, PenTool, Rocket, Search, Star } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink, ExampleBadge, SectionHeading } from "@/components/ui/Primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import type { Settings, ShowcaseMedia, Testimonial } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

export function Marquee() {
  const words = [
    "Criação de Sites", "Gravação", "Mixagem", "Masterização", "Música com IA", "Videoclipes",
    "Comerciais", "Edição de Vídeo", "Marketing Digital", "Identidade Visual", "Registro de Músicas", "Vinhetas",
  ];
  const row = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-graphite/60 py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-xl font-bold uppercase tracking-wide text-white/25 sm:text-2xl">
            {w} <span className="h-2 w-2 rotate-45 bg-gradient-to-br from-purple to-green" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function AboutSection({ settings }: { settings: Settings }) {
  const { site } = settings;
  const pillars = [
    { t: "Tecnologia", d: "Sites modernos, rápidos e otimizados." },
    { t: "Música", d: "Estúdio, produção e criação com IA." },
    { t: "Audiovisual", d: "Clipes, comerciais e eventos." },
    { t: "Marketing", d: "Conteúdo que gera presença." },
  ];
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="sobre-titulo">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div className="reveal relative order-2 lg:order-1">
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-graphite to-ink">
            {site.aboutImage ? (
              <SmartImage src={site.aboutImage} alt={`Equipe ${site.name}`} fill sizes="(max-width: 1024px) 90vw, 450px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center">
                <LogoMark className="h-40 w-40 opacity-90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <div className="absolute inset-x-5 bottom-5 glass rounded-2xl p-4">
              <p className="font-display text-sm font-semibold">{site.name}</p>
              <p className="mt-0.5 text-xs text-green">{site.slogan}</p>
            </div>
          </div>
          <div aria-hidden="true" className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-purple/40 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-8 -right-4 -z-10 h-40 w-40 rounded-full bg-green/25 blur-3xl" />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading align="left" eyebrow="Quem somos" title={<span id="sobre-titulo">{site.aboutTitle}</span>} />
          <div className="reveal -mt-6 space-y-4 text-base leading-relaxed text-mute sm:text-lg">
            {site.aboutText.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <li key={p.t} className="reveal glass rounded-2xl p-4" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
                <p className="font-display font-semibold text-white">{p.t}</p>
                <p className="mt-1 text-sm text-mute">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const steps = [
    { Icon: Search, t: "Briefing", d: "Entendemos seu objetivo, público e referências." },
    { Icon: PenTool, t: "Criação", d: "Desenvolvemos a proposta criativa e o planejamento." },
    { Icon: Headphones, t: "Produção", d: "Executamos com equipamentos e ferramentas profissionais." },
    { Icon: Rocket, t: "Entrega", d: "Ajustes finais, entrega no formato certo e suporte." },
  ];
  return (
    <section className="relative py-24 sm:py-28" aria-labelledby="processo-titulo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Como trabalhamos" title={<span id="processo-titulo">Do primeiro contato <span className="text-gradient">à entrega final</span></span>} />
        <ol className="relative grid gap-5 md:grid-cols-4">
          <div aria-hidden="true" className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-purple/60 to-transparent md:block" />
          {steps.map(({ Icon, t, d }, i) => (
            <li key={t} className="reveal relative text-center" style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
              <span className="relative mx-auto grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full border border-white/10 bg-ink shadow-[0_0_0_8px_#090909]">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple/40 to-green/20 blur-md" />
                <Icon className="relative h-7 w-7 text-green" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-purple-soft">Etapa {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{t}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm text-mute">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ExperienceTeaser({ media }: { media: ShowcaseMedia[] }) {
  const audios = media.filter((m) => m.kind === "audio").length;
  const videos = media.filter((m) => m.kind === "video").length;
  return (
    <section className="relative py-20" aria-labelledby="exp-titulo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal grain relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple/30 via-graphite to-green/15 p-8 sm:p-14">
          <div aria-hidden="true" className="absolute -right-10 -top-10 flex h-64 items-end gap-1.5 opacity-40">
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} className="eq-bar w-2.5 rounded-sm bg-gradient-to-t from-purple to-green" style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 6) * 0.15}s` }} />
            ))}
          </div>
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green">Player exclusivo</p>
            <h2 id="exp-titulo" className="mt-4 font-display text-3xl font-bold sm:text-5xl">Experimente nosso trabalho</h2>
            <p className="mt-4 text-mute sm:text-lg">
              Ouça produções do estúdio, assista a vídeos e conheça projetos feitos com inteligência artificial — direto no navegador, no computador ou no celular.
            </p>
            <p className="mt-3 text-sm text-white/60">
              {audios} áudio{audios === 1 ? "" : "s"} · {videos} vídeo{videos === 1 ? "" : "s"} disponíveis
            </p>
            <ButtonLink href="/experimente" className="mt-8">
              Abrir o player <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="relative py-24 sm:py-28" aria-labelledby="depo-titulo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Depoimentos" title={<span id="depo-titulo">O que dizem <span className="text-gradient">nossos clientes</span></span>} />
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <figure key={t.id} className="glow-card glass reveal flex flex-col rounded-3xl p-7" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <span className="spot" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <MessageSquareQuote className="h-8 w-8 text-purple-soft" />
                {t.is_example && <ExampleBadge />}
              </div>
              <div className="mt-4 flex gap-0.5" aria-label={`${t.rating} de 5 estrelas`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`h-4 w-4 ${k < t.rating ? "fill-green text-green" : "text-white/20"}`} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-white/85 leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-purple to-green font-display font-bold">
                  {t.avatar_url ? <SmartImage src={t.avatar_url} alt="" fill sizes="44px" className="object-cover" /> : t.name.charAt(0)}
                </span>
                <span>
                  <span className="block font-semibold">{t.name}</span>
                  <span className="block text-xs text-mute">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBanner({ settings }: { settings: Settings }) {
  return (
    <section className="relative py-16" aria-labelledby="cta-titulo">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal relative overflow-hidden rounded-[2rem] p-[1px]">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-purple via-[#8b5cf6] to-green" />
          <div className="grain relative overflow-hidden rounded-[calc(2rem-1px)] bg-ink px-6 py-14 text-center sm:px-14 sm:py-20">
            <div aria-hidden="true" className="absolute left-1/2 top-0 h-60 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/40 blur-[100px]" />
            <h2 id="cta-titulo" className="relative mx-auto max-w-3xl font-display text-3xl font-bold text-balance sm:text-5xl">
              {settings.site.ctaTitle}
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-mute sm:text-lg">{settings.site.ctaText}</p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/orcamento" className="px-8 py-4">
                Solicitar Orçamento <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href={waLink(settings.contact.whatsapp, settings.contact.whatsappMessage)} external variant="whatsapp" className="px-8 py-4">
                <WhatsAppIcon /> Chamar no WhatsApp
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
