import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { ButtonLink, ExampleBadge } from "@/components/ui/Primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { getPortfolio, getPortfolioItem } from "@/lib/content";
import { portfolioLabel, SITE_URL } from "@/lib/constants";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPortfolioItem(slug);
  if (!p) return { title: "Projeto não encontrado" };
  return {
    title: p.title,
    description: p.description.slice(0, 160),
    alternates: { canonical: `/portfolio/${p.slug}` },
    openGraph: { title: p.title, description: p.description.slice(0, 160), url: `${SITE_URL}/portfolio/${p.slug}`, ...(p.cover_url && !p.cover_url.endsWith(".svg") ? { images: [p.cover_url] } : {}) },
  };
}

export default async function PortfolioItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getPortfolioItem(slug), getPortfolio()]);
  if (!item) notFound();
  const more = all.filter((p) => p.id !== item.id && p.category === item.category).concat(all.filter((p) => p.id !== item.id && p.category !== item.category)).slice(0, 3);

  return (
    <>
      <section className="grain relative overflow-hidden pb-10 pt-36 sm:pt-40">
        <div aria-hidden="true" className="absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-purple/25 blur-[120px]" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <Link href="/portfolio" className="mb-6 inline-flex items-center gap-2 text-sm text-mute transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar ao portfólio
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/portfolio?categoria=${item.category}`} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green ring-1 ring-white/10">
              {portfolioLabel(item.category)}
            </Link>
            {item.is_example && <ExampleBadge />}
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{item.title}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="reveal">
          {(item.media_type === "video" || item.media_type === "youtube") && item.media_url ? (
            <VideoPlayer url={item.media_url} poster={item.cover_url} title={item.title} />
          ) : item.media_type === "audio" && item.media_url ? (
            <AudioPlayer compact tracks={[{ id: item.id, title: item.title, subtitle: portfolioLabel(item.category), url: item.media_url, cover: item.cover_url, isExample: item.is_example }]} />
          ) : (item.media_url || item.cover_url) ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10">
              <SmartImage src={item.media_url || item.cover_url} alt={item.title} fill priority sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" />
            </div>
          ) : null}
        </div>

        <div className="reveal mt-10 grid gap-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-4 whitespace-pre-line text-lg leading-relaxed text-white/80">{item.description}</div>
          <div className="flex flex-col gap-3">
            {item.external_url && (
              <ButtonLink href={item.external_url} external variant="ghost">
                Acessar projeto <ExternalLink className="h-4 w-4" />
              </ButtonLink>
            )}
            <ButtonLink href="/orcamento">Quero um projeto assim</ButtonLink>
          </div>
        </div>

        {item.gallery?.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {item.gallery.map((g, i) => (
              <div key={g + i} className="reveal relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                <SmartImage src={g} alt={`${item.title} — imagem ${i + 1}`} fill sizes="(max-width: 640px) 100vw, 500px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {more.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="mais-h">
          <h2 id="mais-h" className="reveal mb-8 font-display text-2xl font-bold">Veja também</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <PortfolioCard key={p.id} item={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
