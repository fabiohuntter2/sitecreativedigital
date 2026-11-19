"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";

type Graph = { ctx: AudioContext; analyser: AnalyserNode };
const graphs = new WeakMap<HTMLMediaElement, Graph>();

/** O visualizador só liga o áudio ao Web Audio quando a origem permite (senão o som ficaria mudo). */
function canAnalyse(src: string) {
  try {
    const u = new URL(src, window.location.href);
    return u.origin === window.location.origin || /\.supabase\.co$/.test(u.hostname);
  } catch {
    return false;
  }
}

/** Liga (uma única vez por elemento) o <audio> a um analisador de frequências. */
export function connectAnalyser(audio: HTMLAudioElement): Graph | null {
  const existing = graphs.get(audio);
  if (existing) {
    if (existing.ctx.state === "suspended") existing.ctx.resume().catch(() => undefined);
    return existing;
  }
  if (!canAnalyse(audio.currentSrc || audio.src)) return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    const ctx = new AC();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const g = { ctx, analyser };
    graphs.set(audio, g);
    return g;
  } catch {
    return null;
  }
}

/**
 * Barras espelhadas que reagem ao som real da faixa (Web Audio API).
 * Sem análise disponível, mostra uma animação suave apenas enquanto toca.
 */
export function AudioVisualizer({ audioRef, playing }: { audioRef: React.RefObject<HTMLAudioElement | null>; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levels = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;
    const c = canvas.getContext("2d");
    if (!c) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = prefersReducedMotion();
    const graph = playing ? connectAnalyser(audio) : graphs.get(audio) ?? null;
    const data = graph ? new Uint8Array(graph.analyser.frequencyBinCount) : null;
    let raf = 0;
    let t = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * DPR)) {
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
      }
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.clearRect(0, 0, w, h);
      const bars = Math.max(24, Math.min(64, Math.floor(w / 9)));
      const half = Math.ceil(bars / 2);
      if (levels.current.length !== half) levels.current = Array(half).fill(0.06);

      if (graph && data && playing) {
        graph.analyser.getByteFrequencyData(data);
        for (let i = 0; i < half; i++) {
          // escala logarítmica: graves à esquerda/centro, mais detalhes nos médios
          const idx = Math.min(data.length - 1, Math.floor(Math.pow(i / half, 1.6) * data.length * 0.85));
          const v = data[idx] / 255;
          levels.current[i] += (v - levels.current[i]) * 0.5;
        }
      } else if (playing && !reduced) {
        t += 0.06;
        for (let i = 0; i < half; i++) {
          const v = 0.25 + 0.35 * Math.abs(Math.sin(t + i * 0.45)) * Math.abs(Math.cos(t * 0.7 + i * 0.2));
          levels.current[i] += (v - levels.current[i]) * 0.2;
        }
      } else {
        for (let i = 0; i < half; i++) levels.current[i] += (0.06 - levels.current[i]) * 0.12;
      }

      const gap = 3;
      const bw = (w - gap * (bars - 1)) / bars;
      const grad = c.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, "#713bce");
      grad.addColorStop(0.6, "#8b5cf6");
      grad.addColorStop(1, "#39d6a0");
      c.fillStyle = grad;
      c.shadowColor = "rgba(57,214,160,.55)";
      c.shadowBlur = playing ? 10 : 0;
      for (let b = 0; b < bars; b++) {
        const i = b < half ? half - 1 - b : b - half; // espelhado a partir do centro
        const lv = Math.max(0.04, Math.min(1, levels.current[i] ?? 0.05));
        const bh = Math.max(3, lv * h);
        const x = b * (bw + gap);
        const y = (h - bh) / 2;
        const r = Math.min(bw / 2, 3);
        c.beginPath();
        c.roundRect(x, y, bw, bh, r);
        c.fill();
      }
      const settling = !playing && levels.current.some((v) => v > 0.07);
      if (playing || settling) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, audioRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="viz-canvas" />;
}
