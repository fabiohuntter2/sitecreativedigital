"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Database,
  ExternalLink,
  Film,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings2,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/brand/Logo";

const NAV = [
  { href: "/admin", label: "Visão geral", Icon: LayoutDashboard },
  { href: "/admin/orcamentos", label: "Orçamentos", Icon: Inbox },
  { href: "/admin/servicos", label: "Serviços e preços", Icon: Briefcase },
  { href: "/admin/portfolio", label: "Portfólio", Icon: Database },
  { href: "/admin/midias", label: "Músicas e vídeos", Icon: Film },
  { href: "/admin/depoimentos", label: "Depoimentos", Icon: MessageSquareQuote },
  { href: "/admin/configuracoes", label: "Textos, imagens e contatos", Icon: Settings2 },
];

export function AdminShell({ children, email, mode }: { children: React.ReactNode; email: string; mode: "supabase" | "local" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Painel" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-3 py-2">
        <LogoMark className="h-9 w-9" />
        <span className="font-display font-bold leading-tight">
          Huntter<span className="block text-xs font-normal text-mute">Painel administrativo</span>
        </span>
      </Link>
      <ul className="mt-8 space-y-1">
        {NAV.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active(href) ? "bg-gradient-to-r from-purple/40 to-green/10 text-white ring-1 ring-white/10" : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4.5 w-4.5" /> {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-2 pt-8 text-xs">
        <p className="rounded-xl bg-white/5 px-3 py-2 text-mute">
          Banco: <strong className="text-white">{mode === "supabase" ? "Supabase" : "Local (arquivo)"}</strong>
        </p>
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> Ver site
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/70 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Sair <span className="ml-auto truncate text-white/35">{email}</span>
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-white/5 bg-ink-2 p-5 lg:block">{nav}</aside>
      <div className="flex items-center justify-between border-b border-white/5 bg-ink-2 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-display font-bold">
          <LogoMark className="h-8 w-8" /> Painel
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu" className="grid h-10 w-10 place-items-center rounded-full bg-white/5">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/95 p-5 lg:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/5">
            <X className="h-5 w-5" />
          </button>
          {nav}
        </div>
      )}
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
