import Image from "next/image";
import { LogoMark } from "@/components/brand/Logo";

/**
 * Composição cinematográfica do banner: estúdio (forma de onda), câmera (visor REC),
 * código (criação de sites) e linha do tempo de edição de vídeo — tudo em CSS/SVG, leve e animado.
 */
export function HeroVisual({ image }: { image?: string }) {
  const bars = [0.4, 0.7, 0.55, 0.9, 0.5, 1, 0.65, 0.8, 0.45, 0.95, 0.6, 0.75, 0.5, 0.85, 0.4, 0.7];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] select-none" aria-hidden="true">
      {/* anel orbital */}
      <div className="absolute inset-[12%] rounded-full bg-[conic-gradient(from_0deg,#713bce,#39d6a0,#713bce00_60%,#713bce)] p-[2px] animate-spin-slow">
        <div className="h-full w-full rounded-full bg-ink" />
      </div>
      <div className="absolute inset-[12%] rounded-full bg-purple/25 blur-3xl animate-pulse-glow" />
      <div className="absolute inset-[18%] overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-graphite to-ink">
        {image ? (
          <Image src={image} alt="" fill priority sizes="(max-width: 768px) 70vw, 400px" className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <LogoMark className="h-1/2 w-1/2 drop-shadow-[0_0_30px_rgba(113,59,206,.6)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
      </div>

      {/* card: estúdio de áudio */}
      <div className="glass absolute left-0 top-[6%] w-[46%] rounded-2xl p-3.5 shadow-2xl animate-float">
        <div className="mb-2 flex items-center justify-between text-[0.6rem] font-semibold uppercase tracking-widest text-mute">
          <span>Studio · Mix</span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
          </span>
        </div>
        <div className="flex h-12 items-end gap-[3px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="eq-bar w-full rounded-sm bg-gradient-to-t from-purple to-green"
              style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.12}s`, animationDuration: `${0.9 + (i % 4) * 0.18}s` }}
            />
          ))}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-purple to-green" />
        </div>
      </div>

      {/* card: câmera */}
      <div className="glass absolute right-0 top-[16%] w-[38%] rounded-2xl p-3 shadow-2xl animate-float-slow">
        <div className="relative aspect-video rounded-lg border border-white/10 bg-gradient-to-br from-purple/30 via-ink to-green/20">
          {["left-1 top-1 border-l-2 border-t-2", "right-1 top-1 border-r-2 border-t-2", "left-1 bottom-1 border-b-2 border-l-2", "right-1 bottom-1 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`absolute h-3 w-3 border-white/80 ${c}`} />
          ))}
          <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
          <span className="absolute left-2 top-2 flex items-center gap-1 text-[0.5rem] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            REC
          </span>
          <span className="absolute bottom-1.5 right-2 text-[0.5rem] font-bold text-green">4K · 24fps</span>
        </div>
      </div>

      {/* card: código */}
      <div className="glass absolute bottom-[12%] left-[2%] w-[42%] rounded-2xl p-3 font-mono text-[0.58rem] leading-relaxed shadow-2xl animate-float-slow">
        <div className="mb-1.5 flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400/80" />
          <span className="h-2 w-2 rounded-full bg-amber-300/80" />
          <span className="h-2 w-2 rounded-full bg-green/80" />
        </div>
        <p><span className="text-purple-soft">const</span> <span className="text-white">site</span> = <span className="text-green">criar</span>({"{"}</p>
        <p className="pl-3"><span className="text-white/70">design:</span> <span className="text-amber-200">&quot;exclusivo&quot;</span>,</p>
        <p className="pl-3"><span className="text-white/70">seo:</span> <span className="text-purple-soft">true</span>,</p>
        <p>{"});"}<span className="ml-0.5 inline-block h-2.5 w-1 translate-y-0.5 animate-pulse bg-green" /></p>
      </div>

      {/* card: linha do tempo de vídeo */}
      <div className="glass absolute bottom-[4%] right-[2%] w-[48%] rounded-2xl p-3 shadow-2xl animate-float">
        <div className="mb-2 flex items-center justify-between text-[0.6rem] font-semibold uppercase tracking-widest text-mute">
          <span>Timeline · Edição</span>
          <span className="text-green">00:42</span>
        </div>
        <div className="relative space-y-1.5">
          <div className="flex gap-1">
            <span className="h-3 w-[30%] rounded bg-purple/80" />
            <span className="h-3 w-[22%] rounded bg-purple-soft/70" />
            <span className="h-3 w-[40%] rounded bg-purple/60" />
          </div>
          <div className="flex gap-1">
            <span className="h-3 w-[45%] rounded bg-green/70" />
            <span className="h-3 w-[50%] rounded bg-green/40" />
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-[70%] rounded bg-white/20" />
          </div>
          <span className="absolute -top-1 bottom-0 w-px bg-white shadow-[0_0_8px_#fff] [animation:playhead_6s_linear_infinite]" />
        </div>
      </div>

      {/* partículas */}
      {[
        "left-[30%] top-[2%] h-1.5 w-1.5 bg-green",
        "right-[22%] top-[6%] h-1 w-1 bg-purple-soft",
        "left-[6%] top-[52%] h-1 w-1 bg-white",
        "right-[4%] top-[60%] h-1.5 w-1.5 bg-green",
        "left-[52%] bottom-[0%] h-1 w-1 bg-purple-soft",
      ].map((c) => (
        <span key={c} className={`absolute rounded-full animate-pulse-glow ${c}`} />
      ))}
      <style>{`@keyframes playhead { from { left: 0% } to { left: 100% } }`}</style>
    </div>
  );
}
