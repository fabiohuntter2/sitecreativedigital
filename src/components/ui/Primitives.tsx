import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "whatsapp" | "outline";

const base =
  "magnetic group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition duration-300 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-purple via-[#8b5cf6] to-green text-white shadow-[0_10px_40px_-10px_rgba(113,59,206,.8)] hover:shadow-[0_14px_50px_-8px_rgba(57,214,160,.65)] hover:-translate-y-0.5",
  ghost: "border border-white/15 bg-white/5 text-white backdrop-blur hover:border-white/40 hover:bg-white/10 hover:-translate-y-0.5",
  outline: "border border-purple/60 text-white hover:bg-purple/20 hover:-translate-y-0.5",
  whatsapp: "bg-[#25d366] text-[#062b16] hover:bg-[#3be37a] hover:-translate-y-0.5 shadow-[0_10px_30px_-12px_rgba(37,211,102,.8)]",
};

/** Brilho que atravessa o botão no hover (microinteração). */
const Shine = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-sm transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
  />
);

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  external,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; external?: boolean }) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link {...props} {...ext} className={`${base} ${variants[variant]} ${className}`}>
      <Shine />
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      <Shine />
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-green">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
}) {
  return (
    <div className={`reveal mb-12 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag className="split-words mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </Tag>
      {text && <p className="mt-5 text-base leading-relaxed text-mute sm:text-lg">{text}</p>}
    </div>
  );
}

export function ExampleBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-amber-200 ${className}`}
      title="Conteúdo demonstrativo — substitua pelo painel administrativo"
    >
      Exemplo
    </span>
  );
}

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text?: ReactNode }) {
  return (
    <section className="grain relative overflow-hidden pb-16 pt-36 sm:pt-44">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-purple/30 blur-[120px]" />
      <div aria-hidden="true" className="absolute -right-40 top-20 h-[300px] w-[420px] rounded-full bg-green/15 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} text={text} />
      </div>
    </section>
  );
}
