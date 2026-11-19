import Link from "next/link";
import { Headphones, Image as ImageIcon, Link2, Play } from "lucide-react";
import { ExampleBadge } from "@/components/ui/Primitives";
import { SmartImage } from "@/components/ui/SmartImage";
import { portfolioLabel } from "@/lib/constants";
import type { PortfolioItem } from "@/lib/types";

const TYPE_ICON = { video: Play, youtube: Play, audio: Headphones, image: ImageIcon, link: Link2 } as const;

export function PortfolioCard({ item, index = 0 }: { item: PortfolioItem; index?: number }) {
  const Icon = TYPE_ICON[item.media_type] ?? ImageIcon;
  return (
    <article className="reveal group relative" style={{ "--d": `${(index % 6) * 60}ms` } as React.CSSProperties}>
      <Link
        href={`/portfolio/${item.slug}`}
        className="glow-card block overflow-hidden rounded-3xl border border-white/10 bg-graphite"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {item.cover_url ? (
            <SmartImage
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple/40 to-green/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur-md ring-1 ring-white/30 transition duration-500 group-hover:scale-100 group-hover:opacity-100">
            <Icon className="h-6 w-6" />
          </span>
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-ink/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-green backdrop-blur">
              {portfolioLabel(item.category)}
            </span>
            {item.is_example && <ExampleBadge />}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-bold transition group-hover:text-green">{item.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-mute">{item.description}</p>
        </div>
      </Link>
    </article>
  );
}
