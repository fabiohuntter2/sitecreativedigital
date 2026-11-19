"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

/**
 * Vídeo de fundo cinematográfico do banner (mudo, em loop).
 * Só carrega depois que a página abriu, não roda com "reduzir movimento" nem em "economia de dados",
 * e pausa quando sai da tela.
 */
export function HeroBackgroundVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData || !src) return;
    const t = setTimeout(() => setEnabled(true), 600); // não disputa com o carregamento inicial
    return () => clearTimeout(t);
  }, [src]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !enabled) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [enabled]);

  if (!src) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      {enabled ? (
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          className="h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-[1500ms] [&.ready]:opacity-30"
          onCanPlay={(e) => e.currentTarget.classList.add("ready")}
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full scale-105 object-cover opacity-20" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
    </div>
  );
}
