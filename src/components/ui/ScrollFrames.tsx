"use client";

import { useEffect, useRef } from "react";
import { SmartImage } from "@/components/ui/SmartImage";

/**
 * Sequência de quadros controlada pela rolagem.
 * frames[0] aparece quando o bloco entra na tela; o último quadro aparece
 * quando o bloco chega perto do meio da tela. Rolar para cima volta a animação.
 */
export function ScrollFrames({
  frames,
  alt,
  sizes,
  className = "object-cover object-top",
}: {
  frames: string[];
  alt: string;
  sizes?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || frames.length < 2) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-frame]"));
    const last = frames.length - 1;

    const paint = (p: number) => {
      const idx = p * last;
      layers.forEach((el, i) => {
        if (i === 0) return;
        const o = Math.min(1, Math.max(0, idx - (i - 1)));
        // curva suave: a troca acontece mais no meio do intervalo (menos "fantasma")
        const eased = o * o * (3 - 2 * o);
        el.style.opacity = eased.toFixed(3);
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = root.getBoundingClientRect();
      // começa quando o topo da foto entra (90% da tela) e termina quando o centro da foto chega a 50%
      const start = vh * 0.9;
      const end = vh * 0.5 - r.height / 2;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      paint(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames]);

  return (
    <div ref={ref} className="absolute inset-0">
      {frames.map((src, i) => (
        <div
          key={src}
          data-frame={i}
          className="absolute inset-0 will-change-[opacity]"
          style={{ opacity: i === 0 ? 1 : 0 }}
          aria-hidden={i === frames.length - 1 ? undefined : true}
        >
          <SmartImage
            src={src}
            alt={i === frames.length - 1 ? alt : ""}
            fill
            sizes={sizes}
            className={className}
            priority={false}
          />
        </div>
      ))}
    </div>
  );
}
