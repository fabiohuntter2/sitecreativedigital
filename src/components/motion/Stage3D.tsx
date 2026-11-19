"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";

/**
 * Palco 3D: inclina o conteúdo acompanhando o mouse (computador) ou o giroscópio
 * de leve (celular). Filhos com style={{ transform: "translateZ(Npx)" }} ganham profundidade.
 */
export function Stage3D({ children, className = "", max = 12 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tx = x * max * 2;
      ty = -y * max * 2;
      kick();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 30)) * max * 0.7;
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * -max * 0.7;
      kick();
    };

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    else window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, [max]);

  return (
    <div className={className} style={{ perspective: "1200px" }}>
      <div ref={ref} className="relative h-full w-full will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
