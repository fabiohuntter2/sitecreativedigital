"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/experimente", label: "Experimente" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Header({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/5 bg-ink/75 py-3 backdrop-blur-xl" : "py-5"
      }`}
    >
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-purple focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="shrink-0" aria-label="Huntter Produções — início">
          <Logo logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[.03] p-1 backdrop-blur">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`relative block rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive(n.href) ? "bg-white/10 text-white" : "text-white/65 hover:text-white"
                  }`}
                >
                  {n.label}
                  {isActive(n.href) && (
                    <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-purple to-green" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/orcamento"
            className="magnetic hidden rounded-full bg-gradient-to-r from-purple to-green px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-10px_rgba(113,59,206,.9)] transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Solicitar Orçamento
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* menu mobile */}
      <div
        id="menu-mobile"
        className={`fixed inset-0 top-0 -z-10 bg-ink/95 backdrop-blur-xl transition-all duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Menu móvel" className="flex h-full flex-col justify-center px-8">
          <ul className="space-y-2">
            {NAV.map((n, i) => (
              <li
                key={n.href}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                className={`transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"}`}
              >
                <Link
                  href={n.href}
                  className={`block py-2 font-display text-3xl font-bold ${isActive(n.href) ? "text-gradient" : "text-white/80"}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/orcamento"
            className="mt-10 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-purple to-green px-6 py-4 font-semibold"
          >
            Solicitar Orçamento
          </Link>
        </nav>
      </div>
    </header>
  );
}
