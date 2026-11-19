"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeId } from "@/lib/media";

/**
 * Player de vídeo: arquivos (mp4/webm) com o player nativo — compatível com celulares —
 * ou YouTube em modo leve (o iframe só carrega após o clique, preservando a velocidade do site).
 */
export function VideoPlayer({ url, poster, title }: { url: string; poster?: string; title: string }) {
  const yt = youtubeId(url);
  const [active, setActive] = useState(false);

  if (yt) {
    const thumb = poster || `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        {active ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button type="button" onClick={() => setActive(true)} className="group absolute inset-0" aria-label={`Reproduzir vídeo: ${title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
            <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-purple to-green shadow-2xl transition group-hover:scale-110">
              <Play className="ml-1 h-8 w-8 fill-white" />
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video key={url} controls playsInline preload="metadata" poster={poster || undefined} className="h-full w-full" aria-label={title}>
        <source src={url} />
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
}
