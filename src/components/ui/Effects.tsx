"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Controlador único de efeitos de movimento (leve, sem bibliotecas):
 * - .reveal              → surge ao entrar na tela
 * - .split-words         → título revelado palavra por palavra
 * - .glow-card           → brilho que segue o mouse
 * - .tilt                → card inclina em 3D com o mouse
 * - .magnetic            → botão "puxa" na direção do mouse
 * - [data-parallax="n"]  → move-se com a rolagem (profundidade)
 * - [data-progress]      → recebe --progress (0→1) conforme a seção atravessa a tela
 * Respeita "reduzir movimento" e só usa efeitos de mouse em telas com mouse.
 */

function splitWords(root: HTMLElement) {
  if (root.dataset.split === "1") return;
  root.dataset.split = "1";
  let i = 0;
  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // textos com gradiente são tratados como uma unidade (o recorte do gradiente quebra se dividido)
      if (el.classList.contains("text-gradient") || el.classList.contains("sr-only")) {
        el.classList.add("w");
        el.style.setProperty("--i", String(i++));
        return;
      }
      [...el.childNodes].forEach(walk);
      return;
    }
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
      else {
        const s = document.createElement("span");
        s.className = "w";
        s.style.setProperty("--i", String(i++));
        s.textContent = part;
        frag.appendChild(s);
      }
    });
    node.parentNode?.replaceChild(frag, node);
  };
  [...root.childNodes].forEach(walk);
}

export function Effects() {
  const pathname = usePathname();

  // revelação ao rolar + títulos palavra por palavra
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => {
      if (!reduced) document.querySelectorAll<HTMLElement>(".split-words:not([data-split])").forEach(splitWords);
      document.querySelectorAll(".reveal:not(.is-visible), .split-words:not(.is-visible)").forEach((el) => io.observe(el));
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // efeitos de mouse: brilho, inclinação 3D e botões magnéticos
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const fine = window.matchMedia("(pointer: fine)").matches;
    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;

    const resetTilt = () => {
      if (tiltEl) tiltEl.style.transform = "";
      tiltEl = null;
    };
    const resetMag = () => {
      if (magEl) magEl.style.translate = "";
      magEl = null;
    };

    const onMove = (ev: PointerEvent) => {
      const target = ev.target as HTMLElement | null;
      const card = target?.closest?.(".glow-card") as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${ev.clientX - r.left}px`);
        card.style.setProperty("--my", `${ev.clientY - r.top}px`);
      }
      if (reduced || !fine) return;

      const t = target?.closest?.(".tilt") as HTMLElement | null;
      if (t !== tiltEl) resetTilt();
      if (t) {
        tiltEl = t;
        const r = t.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5;
        const y = (ev.clientY - r.top) / r.height - 0.5;
        t.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px)`;
      }

      const m = target?.closest?.(".magnetic") as HTMLElement | null;
      if (m !== magEl) resetMag();
      if (m) {
        magEl = m;
        const r = m.getBoundingClientRect();
        const x = ev.clientX - (r.left + r.width / 2);
        const y = ev.clientY - (r.top + r.height / 2);
        m.style.translate = `${(x * 0.25).toFixed(1)}px ${(y * 0.35).toFixed(1)}px`;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", () => {
      resetTilt();
      resetMag();
    });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // parallax + progresso de seções (atrelados à rolagem)
  useEffect(() => {
    if (prefersReducedMotion()) {
      document.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => el.style.setProperty("--progress", "1"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0");
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(center * speed).toFixed(1)}px`;
      });
      document.querySelectorAll<HTMLElement>("[data-progress]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.6)));
        el.style.setProperty("--progress", p.toFixed(3));
      });
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
  }, [pathname]);

  return null;
}
