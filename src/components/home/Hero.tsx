import { ArrowRight, Sparkles } from "lucide-react";
import { HeroBackgroundVideo } from "@/components/motion/HeroBackgroundVideo";
import { HeroParticles } from "@/components/motion/HeroParticles";
import { TypeRotator } from "@/components/motion/TypeRotator";
import { ButtonLink, Eyebrow } from "@/components/ui/Primitives";
import type { Settings } from "@/lib/types";
import { HeroVisual } from "./HeroVisual";

const WORDS = ["sites", "músicas", "videoclipes", "vinhetas", "comerciais", "marcas", "vídeos com IA"];

export function Hero({ settings }: { settings: Settings }) {
  const { site } = settings;
  return (
    <section className="grain relative isolate overflow-hidden pt-32 sm:pt-36 lg:min-h-[100svh] lg:pt-28">
      {/* vídeo cinematográfico + partículas interativas + iluminação */}
      <HeroBackgroundVideo src={site.heroVideo} poster="/trabalhos/img/hero-bg-poster.webp" />
      <HeroParticles />
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-50" />
      <div aria-hidden="true" data-parallax="-0.15" className="absolute -left-40 -top-40 -z-10 h-[620px] w-[620px] rounded-full bg-purple/35 blur-[140px]" />
      <div aria-hidden="true" data-parallax="0.12" className="absolute -right-40 top-1/3 -z-10 h-[520px] w-[520px] rounded-full bg-green/20 blur-[140px]" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 w-1/3 bg-gradient-to-r from-white/[.06] to-transparent animate-beam" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 sm:px-8 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div className="reveal">
            <Eyebrow>{site.heroEyebrow}</Eyebrow>
          </div>
          <h1 className="reveal split-words mt-6 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl" style={{ "--d": "80ms" } as React.CSSProperties}>
            {site.heroTitle} <span className="text-gradient">{site.heroHighlight}</span>
          </h1>
          <p className="reveal mt-6 font-display text-xl font-semibold text-white/90 sm:text-2xl" style={{ "--d": "140ms" } as React.CSSProperties}>
            Criamos <TypeRotator words={WORDS} className="text-green" />
          </p>
          <p className="reveal mt-4 max-w-xl text-base leading-relaxed text-mute sm:text-lg" style={{ "--d": "200ms" } as React.CSSProperties}>
            {site.heroSubtitle}
          </p>
          <div className="reveal mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--d": "260ms" } as React.CSSProperties}>
            <ButtonLink href="/orcamento" className="px-8 py-4 text-base">
              Solicitar Orçamento <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/servicos" variant="ghost" className="px-8 py-4 text-base">
              <Sparkles className="h-4 w-4 text-green" /> Conheça Nossos Serviços
            </ButtonLink>
          </div>
          <ul className="reveal mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50" style={{ "--d": "320ms" } as React.CSSProperties}>
            {["Web Sites", "Música", "Audiovisual", "Marketing Digital", "Inteligência Artificial"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-green" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal" style={{ "--d": "200ms" } as React.CSSProperties}>
          <HeroVisual image={site.heroImage} />
        </div>
      </div>

      {/* indicador de rolagem */}
      <a href="#sobre" aria-label="Rolar para baixo" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
        <span className="flex h-11 w-7 justify-center rounded-full border border-white/25 pt-2">
          <span className="h-2 w-1 animate-bounce rounded-full bg-green" />
        </span>
      </a>
    </section>
  );
}
