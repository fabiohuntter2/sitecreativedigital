"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Paperclip, Save, Trash2, X } from "lucide-react";
import { deleteRecord, updateQuoteAction } from "@/app/admin/actions";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { QUOTE_STATUS } from "@/lib/constants";
import type { Quote, QuoteStatus } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

function toBrWhatsapp(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length <= 11 ? `55${d}` : d;
}

export function QuotesManager({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<QuoteStatus | "todos">("todos");
  const [open, setOpen] = useState<Quote | null>(null);
  const [status, setStatus] = useState<QuoteStatus>("novo");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  const list = useMemo(() => (filter === "todos" ? quotes : quotes.filter((q) => q.status === filter)), [quotes, filter]);

  const show = (q: Quote) => {
    setOpen(q);
    setStatus(q.status);
    setNotes(q.notes || "");
    setErr("");
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Solicitações de orçamento</h1>
      <p className="text-sm text-mute">Pedidos enviados pelo formulário do site.</p>

      <div className="my-6 flex flex-wrap gap-2">
        {[{ value: "todos", label: "Todos" }, ...QUOTE_STATUS].map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value as QuoteStatus | "todos")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === s.value ? "bg-gradient-to-r from-purple to-green" : "bg-white/5 text-white/70 hover:text-white"}`}
          >
            {s.label} <span className="opacity-60">{s.value === "todos" ? quotes.length : quotes.filter((q) => q.status === s.value).length}</span>
          </button>
        ))}
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-mute">
            <tr className="border-b border-white/5">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Protocolo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((q) => {
              const st = QUOTE_STATUS.find((s) => s.value === q.status);
              return (
                <tr key={q.id} className="border-b border-white/5 last:border-0 hover:bg-white/[.03]">
                  <td className="px-4 py-3 text-mute">{q.created_at ? new Date(q.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{q.protocol}</td>
                  <td className="px-4 py-3 font-semibold">{q.name}</td>
                  <td className="px-4 py-3">{q.service}{q.subservice ? <span className="text-mute"> · {q.subservice}</span> : null}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st?.color}`}>{st?.label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => show(q)} className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 hover:bg-white/10">
                      Abrir
                    </button>
                  </td>
                </tr>
              );
            })}
            {!list.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">Nenhuma solicitação.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="q-title">
          <div className="flex h-full w-full max-w-2xl flex-col bg-ink-2 ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div>
                <h2 id="q-title" className="font-display text-xl font-bold">{open.name}</h2>
                <p className="font-mono text-xs text-mute">{open.protocol}</p>
              </div>
              <button type="button" onClick={() => setOpen(null)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Serviço", `${open.service}${open.subservice ? ` — ${open.subservice}` : ""}`],
                  ["Telefone", open.phone],
                  ["WhatsApp", open.whatsapp],
                  ["E-mail", open.email || "—"],
                  ["Prazo", open.deadline || "—"],
                  ["Investimento", open.budget || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white/5 p-3">
                    <dt className="text-xs uppercase tracking-wider text-mute">{k}</dt>
                    <dd className="mt-1 break-words font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-1 text-xs uppercase tracking-wider text-mute">Descrição</h3>
                <p className="whitespace-pre-wrap rounded-xl bg-white/5 p-4">{open.description}</p>
              </div>
              {open.references && (
                <div>
                  <h3 className="mb-1 text-xs uppercase tracking-wider text-mute">Referências</h3>
                  <p className="whitespace-pre-wrap break-words rounded-xl bg-white/5 p-4">{open.references}</p>
                </div>
              )}
              {open.attachments?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs uppercase tracking-wider text-mute">Arquivos</h3>
                  <ul className="space-y-2">
                    {open.attachments.map((a) => (
                      <li key={a.url}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 hover:bg-white/10">
                          <Paperclip className="h-4 w-4 text-green" /> <span className="truncate">{a.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <a
                  href={waLink(toBrWhatsapp(open.whatsapp || open.phone), `Olá, ${open.name.split(" ")[0]}! Aqui é da Huntter Produções, sobre sua solicitação ${open.protocol} (${open.service}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 font-semibold text-[#062b16]"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Responder no WhatsApp
                </a>
                {open.email && (
                  <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Orçamento ${open.protocol}`)}`} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold ring-1 ring-white/15 hover:bg-white/10">
                    <Mail className="h-4 w-4" /> E-mail
                  </a>
                )}
              </div>
              <div className="grid gap-4 border-t border-white/5 pt-5">
                <div>
                  <label htmlFor="q-status" className="mb-2 block font-semibold">Status</label>
                  <select id="q-status" className="field" value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
                    {QUOTE_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="q-notes" className="mb-2 block font-semibold">Anotações internas</label>
                  <textarea id="q-notes" rows={4} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                {err && <p className="text-red-300">{err}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Excluir esta solicitação definitivamente?")) return;
                  start(async () => {
                    const r = await deleteRecord("quotes", open.id);
                    if (r.ok) {
                      setOpen(null);
                      router.refresh();
                    } else setErr(r.error);
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await updateQuoteAction(open.id, { status, notes });
                    if (r.ok) {
                      setOpen(null);
                      router.refresh();
                    } else setErr(r.error);
                  })
                }
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple to-green px-6 py-2.5 text-sm font-semibold"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
