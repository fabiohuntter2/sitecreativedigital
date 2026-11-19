"use client";

import { useEffect, useMemo, useState } from "react";
import { PORTFOLIO_CATEGORIES } from "@/lib/constants";
import type { PortfolioItem } from "@/lib/types";
import { PortfolioCard } from "./PortfolioCard";

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [cat, setCat] = useState("todos");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("categoria");
    if (c && PORTFOLIO_CATEGORIES.some((x) => x.value === c)) setCat(c);
  }, []);

  const choose = (value: string) => {
    setCat(value);
    const url = new URL(window.location.href);
    if (value === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", value);
    window.history.replaceState(null, "", url);
  };

  const filtered = useMemo(() => (cat === "todos" ? items : items.filter((i) => i.category === cat)), [items, cat]);
  const count = (v: string) => items.filter((i) => i.category === v).length;

  return (
    <div>
      <div role="tablist" aria-label="Filtrar portfólio por categoria" className="mb-10 flex flex-wrap justify-center gap-2">
        {[{ value: "todos", label: "Todos" }, ...PORTFOLIO_CATEGORIES].map((c) => {
          const n = c.value === "todos" ? items.length : count(c.value);
          return (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={cat === c.value}
              onClick={() => choose(c.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                cat === c.value
                  ? "bg-gradient-to-r from-purple to-green text-white shadow-lg"
                  : "border border-white/10 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              {c.label} <span className="ml-1 text-xs opacity-60">{n}</span>
            </button>
          );
        })}
      </div>
      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <PortfolioCard key={p.id} item={p} index={i} />
          ))}
        </div>
      ) : (
        <p className="glass rounded-3xl p-10 text-center text-mute">Em breve, novos trabalhos nesta categoria.</p>
      )}
    </div>
  );
}
