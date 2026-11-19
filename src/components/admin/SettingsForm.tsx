"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";
import { UploadField } from "./UploadField";

type Section = keyof Settings;
type F = { key: string; label: string; type?: "text" | "textarea" | "upload"; help?: string };

const GROUPS: { section: Section; title: string; desc: string; fields: F[] }[] = [
  {
    section: "site",
    title: "Marca e textos principais",
    desc: "Nome, slogan, logotipo, banner e apresentação da empresa.",
    fields: [
      { key: "name", label: "Nome da empresa" },
      { key: "slogan", label: "Slogan" },
      { key: "logoUrl", label: "Logotipo (opcional — substitui o logo vetorial)", type: "upload", help: "Use PNG/SVG com fundo transparente, formato horizontal." },
      { key: "heroEyebrow", label: "Banner — linha superior" },
      { key: "heroTitle", label: "Banner — frase de impacto (parte branca)" },
      { key: "heroHighlight", label: "Banner — frase de impacto (parte em gradiente)" },
      { key: "heroSubtitle", label: "Banner — texto de apoio", type: "textarea" },
      { key: "heroImage", label: "Banner — foto central (opcional)", type: "upload", help: "Imagem quadrada; aparece dentro do anel luminoso." },
      { key: "aboutTitle", label: "Quem somos — título" },
      { key: "aboutText", label: "Quem somos — texto", type: "textarea", help: "Separe parágrafos com uma linha em branco." },
      { key: "aboutImage", label: "Quem somos — foto", type: "upload", help: "Formato retrato (4:5) recomendado." },
      { key: "ctaTitle", label: "Chamada comercial — título" },
      { key: "ctaText", label: "Chamada comercial — texto", type: "textarea" },
      { key: "footerText", label: "Texto do rodapé", type: "textarea" },
    ],
  },
  {
    section: "contact",
    title: "Contatos e WhatsApp",
    desc: "Usados no botão flutuante, rodapé, página de contato e orçamentos.",
    fields: [
      { key: "whatsapp", label: "WhatsApp (somente números, com 55 + DDD)", help: "Ex.: 5598999810660" },
      { key: "whatsappDisplay", label: "WhatsApp (como aparece no site)" },
      { key: "whatsappMessage", label: "Mensagem inicial do WhatsApp", type: "textarea" },
      { key: "email", label: "E-mail comercial" },
      { key: "city", label: "Cidade / endereço (opcional)" },
      { key: "hours", label: "Horário de atendimento (opcional)" },
    ],
  },
  {
    section: "social",
    title: "Redes sociais",
    desc: "Links completos (https://…). Campos vazios não aparecem no site.",
    fields: [
      { key: "instagram", label: "Instagram" },
      { key: "facebook", label: "Facebook" },
      { key: "youtube", label: "YouTube" },
      { key: "tiktok", label: "TikTok" },
    ],
  },
  {
    section: "seo",
    title: "SEO e compartilhamento",
    desc: "Como o site aparece no Google e quando o link é compartilhado.",
    fields: [
      { key: "title", label: "Título do site (até ~60 caracteres)" },
      { key: "description", label: "Descrição (até ~160 caracteres)", type: "textarea" },
      { key: "keywords", label: "Palavras-chave (separadas por vírgula)", type: "textarea" },
      { key: "ogImage", label: "Imagem de compartilhamento (1200×630, opcional)", type: "upload" },
    ],
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [data, setData] = useState<Settings>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = (section: Section, key: string, value: string) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveSettingsAction(data);
      setMsg(r.ok ? { ok: true, text: "Configurações salvas! O site já foi atualizado." } : { ok: false, text: r.error });
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="pb-24">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Textos, imagens e contatos</h1>
      <p className="text-sm text-mute">Tudo o que aparece no site pode ser alterado aqui.</p>

      <div className="mt-8 space-y-8">
        {GROUPS.map((g) => (
          <section key={g.section} className="glass rounded-2xl p-6" aria-labelledby={`g-${g.section}`}>
            <h2 id={`g-${g.section}`} className="font-display text-lg font-bold">{g.title}</h2>
            <p className="mb-5 text-sm text-mute">{g.desc}</p>
            <div className="grid gap-5 md:grid-cols-2">
              {g.fields.map((f) => {
                const id = `${g.section}-${f.key}`;
                const value = String((data[g.section] as Record<string, string>)[f.key] ?? "");
                const full = f.type === "textarea" || f.type === "upload";
                return (
                  <div key={id} className={full ? "md:col-span-2" : ""}>
                    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/90">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea id={id} rows={f.key === "aboutText" ? 6 : 3} className="field resize-y" value={value} onChange={(e) => set(g.section, f.key, e.target.value)} />
                    ) : f.type === "upload" ? (
                      <UploadField id={id} value={value} onChange={(v) => set(g.section, f.key, v)} accept="image/*" />
                    ) : (
                      <input id={id} className="field" value={value} onChange={(e) => set(g.section, f.key, e.target.value)} />
                    )}
                    {f.help && <p className="mt-1.5 text-xs text-mute">{f.help}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-2/95 backdrop-blur lg:left-[270px]">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <p role="status" className={`text-sm ${msg?.ok ? "text-green" : "text-red-300"}`}>{msg?.text}</p>
          <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple to-green px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
