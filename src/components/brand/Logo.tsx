import { useId } from "react";

/** Símbolo "H + play" com órbita roxo → verde, inspirado no logotipo Huntter Creative Studio. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#c9c9d2" />
          <stop offset=".55" stopColor="#7d7d88" />
          <stop offset="1" stopColor="#e9e9ef" />
        </linearGradient>
        <linearGradient id={`brand-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#8b4dff" />
          <stop offset=".55" stopColor="#713bce" />
          <stop offset="1" stopColor="#39d6a0" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* órbita (parte de trás) */}
      <ellipse cx="33" cy="32" rx="27" ry="10" transform="rotate(-28 33 32)" fill="none" stroke={`url(#brand-${id})`} strokeWidth="2.2" opacity=".55" />
      {/* H inclinado */}
      <path d="M12 54 L20.5 54 L30 10 L21.5 10 Z" fill={`url(#chrome-${id})`} />
      <path d="M36 54 L44.5 54 L54 10 L45.5 10 Z" fill={`url(#chrome-${id})`} />
      {/* play central */}
      <path d="M27.5 23 L42.5 32 L27.5 41 Z" fill="#0b0b10" stroke={`url(#brand-${id})`} strokeWidth="2.6" strokeLinejoin="round" filter={`url(#glow-${id})`} />
      {/* órbita (parte da frente) */}
      <path d="M8.5 44.5 C 18 50, 40 44, 57 22" fill="none" stroke={`url(#brand-${id})`} strokeWidth="2.6" strokeLinecap="round" filter={`url(#glow-${id})`} />
    </svg>
  );
}

export function Logo({ logoUrl, compact = false }: { logoUrl?: string; compact?: boolean }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="Huntter Produções" className="h-10 w-auto object-contain" />;
  }
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-10 w-10 shrink-0" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.15rem] font-extrabold italic tracking-tight">
            <span className="bg-gradient-to-b from-white via-zinc-300 to-zinc-500 bg-clip-text pr-[0.08em] text-transparent">HUNTT</span>
            <span className="-ml-[0.08em] bg-gradient-to-b from-green-soft to-green bg-clip-text pr-[0.12em] text-transparent">ER</span>
          </span>
          <span className="mt-1 text-[0.58rem] font-semibold tracking-[0.32em] text-mute">
            CREATIVE <span className="text-green">STUDIO</span>
          </span>
        </span>
      )}
      <span className="sr-only">Huntter Produções — página inicial</span>
    </span>
  );
}
