"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";

/**
 * Cursor personalizado: um ponto e um anel luminoso que seguem o mouse com suavidade
 * e crescem sobre links e botões. O cursor normal continua visível (acessibilidade).
 * Só aparece em telas com mouse e sem "reduzir movimento".
 */
export function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (prefersReducedMotion()) return;
    const d = dot.current!;
    const r = ring.current!;
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let visible = false;

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        d.style.opacity = "1";
        r.style.opacity = "1";
      }
      const hover = (e.target as HTMLElement | null)?.closest?.("a, button, [role=tab], input, select, textarea, label");
      r.dataset.hover = hover ? "1" : "";
    };
    const onLeave = () => {
      visible = false;
      d.style.opacity = "0";
      r.style.opacity = "0";
    };
    const onDown = () => (r.dataset.down = "1");
    const onUp = () => (r.dataset.down = "");

    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </div>
  );
}
