"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GripVertical, Loader2, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { deleteRecord, saveRecord } from "@/app/admin/actions";
import type { EditableTable } from "@/lib/admin-schemas";
import { PORTFOLIO_CATEGORIES, SERVICE_ICONS, SHOWCASE_CATEGORIES, portfolioLabel, showcaseLabel } from "@/lib/constants";
import type { ServiceItem } from "@/lib/types";
import { UploadField } from "./UploadField";

type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "upload" | "slug" | "items" | "gallery";
type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  accept?: string;
  help?: string;
  full?: boolean;
  from?: string;
};
type Row = Record<string, unknown> & { id: string };

type Config = {
  singular: string;
  fields: Field[];
  defaults: Record<string, unknown>;
  titleKey: string;
  subtitle: (r: Row) => string;
  imageKey?: string;
  publishKey?: "published" | "active";
};

const CONFIGS: Record<EditableTable, Config> = {
  services: {
    singular: "serviço",
    titleKey: "title",
    subtitle: (r) => `${(r.items as unknown[])?.length ?? 0} itens · /servicos/${r.slug}`,
    imageKey: "image_url",
    publishKey: "active",
    defaults: { title: "", slug: "", short_description: "", description: "", icon: "sparkles", image_url: "", items: [], price_label: "", whatsapp_message: "", featured: false, active: true, sort_order: 10 },
    fields: [
      { name: "title", label: "Nome do serviço", type: "text" },
      { name: "slug", label: "Endereço (URL)", type: "slug", from: "title", help: "Ex.: criacao-de-sites → /servicos/criacao-de-sites" },
      { name: "short_description", label: "Resumo (aparece nos cards)", type: "textarea", full: true },
      { name: "description", label: "Descrição completa", type: "textarea", full: true },
      { name: "icon", label: "Ícone", type: "select", options: SERVICE_ICONS.map((i) => ({ value: i, label: i })) },
      { name: "price_label", label: "Preço geral (opcional)", type: "text", help: "Ex.: A partir de R$ 300. Vazio = não exibe." },
      { name: "image_url", label: "Imagem / banner", type: "upload", accept: "image/*", full: true },
      { name: "items", label: "Itens do serviço e preços", type: "items", full: true, help: "Preço vazio aparece como “Sob consulta”." },
      { name: "whatsapp_message", label: "Mensagem do botão de WhatsApp", type: "textarea", full: true },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "featured", label: "Destaque", type: "checkbox" },
      { name: "active", label: "Visível no site", type: "checkbox" },
    ],
  },
  portfolio: {
    singular: "projeto",
    titleKey: "title",
    subtitle: (r) => `${portfolioLabel(String(r.category))} · ${r.media_type}`,
    imageKey: "cover_url",
    publishKey: "published",
    defaults: { title: "", slug: "", category: "sites", description: "", cover_url: "", media_type: "image", media_url: "", external_url: "", gallery: [], is_example: false, featured: false, published: true, sort_order: 10 },
    fields: [
      { name: "title", label: "Título", type: "text" },
      { name: "slug", label: "Endereço (URL)", type: "slug", from: "title" },
      { name: "category", label: "Categoria", type: "select", options: PORTFOLIO_CATEGORIES },
      {
        name: "media_type",
        label: "Tipo de mídia principal",
        type: "select",
        options: [
          { value: "image", label: "Imagem" },
          { value: "video", label: "Vídeo (arquivo)" },
          { value: "youtube", label: "Vídeo do YouTube" },
          { value: "audio", label: "Áudio" },
          { value: "link", label: "Link externo" },
        ],
      },
      { name: "cover_url", label: "Capa", type: "upload", accept: "image/*", full: true },
      { name: "media_url", label: "Mídia principal (arquivo ou link do YouTube)", type: "upload", accept: "image/*,video/*,audio/*", full: true },
      { name: "external_url", label: "Link do projeto (opcional)", type: "text", full: true },
      { name: "description", label: "Descrição", type: "textarea", full: true },
      { name: "gallery", label: "Galeria de imagens", type: "gallery", full: true },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "featured", label: "Destaque na página inicial", type: "checkbox" },
      { name: "published", label: "Publicado", type: "checkbox" },
      { name: "is_example", label: "Marcar como EXEMPLO", type: "checkbox" },
    ],
  },
  media: {
    singular: "mídia",
    titleKey: "title",
    subtitle: (r) => `${r.kind === "audio" ? "Áudio" : "Vídeo"} · ${showcaseLabel(String(r.category))}`,
    imageKey: "cover_url",
    publishKey: "published",
    defaults: { title: "", subtitle: "", kind: "audio", category: "musica", url: "", cover_url: "", is_example: false, published: true, sort_order: 10 },
    fields: [
      { name: "title", label: "Título", type: "text" },
      { name: "subtitle", label: "Subtítulo / artista / créditos", type: "text" },
      { name: "kind", label: "Tipo", type: "select", options: [{ value: "audio", label: "Áudio (música)" }, { value: "video", label: "Vídeo" }] },
      { name: "category", label: "Categoria", type: "select", options: SHOWCASE_CATEGORIES },
      { name: "url", label: "Arquivo (MP3, MP4…) ou link do YouTube", type: "upload", accept: "audio/*,video/*", full: true },
      { name: "cover_url", label: "Capa", type: "upload", accept: "image/*", full: true },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "published", label: "Publicado", type: "checkbox" },
      { name: "is_example", label: "Marcar como EXEMPLO", type: "checkbox" },
    ],
  },
  testimonials: {
    singular: "depoimento",
    titleKey: "name",
    subtitle: (r) => String(r.role || ""),
    imageKey: "avatar_url",
    publishKey: "published",
    defaults: { name: "", role: "", text: "", avatar_url: "", rating: 5, is_example: false, published: true, sort_order: 10 },
    fields: [
      { name: "name", label: "Nome do cliente", type: "text" },
      { name: "role", label: "Cargo / empresa / cidade", type: "text" },
      { name: "text", label: "Depoimento", type: "textarea", full: true, help: "Publique apenas depoimentos reais, com autorização do cliente." },
      { name: "avatar_url", label: "Foto (opcional)", type: "upload", accept: "image/*", full: true },
      { name: "rating", label: "Nota (1 a 5)", type: "number" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "published", label: "Publicado", type: "checkbox" },
      { name: "is_example", label: "Marcar como EXEMPLO", type: "checkbox" },
    ],
  },
};

function slugify(v: string) {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function CrudManager({ table, rows, title }: { table: EditableTable; rows: Row[]; title: string }) {
  const cfg = CONFIGS[table];
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");

  const list = useMemo(
    () => rows.filter((r) => String(r[cfg.titleKey] ?? "").toLowerCase().includes(query.toLowerCase())),
    [rows, query, cfg.titleKey],
  );

  const openNew = () => {
    setIsNew(true);
    setEditing({ id: "", ...structuredClone(cfg.defaults) });
    setMsg(null);
  };
  const openEdit = (r: Row) => {
    setIsNew(false);
    setEditing(structuredClone(r));
    setMsg(null);
  };

  const set = (name: string, value: unknown) =>
    setEditing((e) => {
      if (!e) return e;
      const next: Row = { ...e, [name]: value };
      const slugField = cfg.fields.find((f) => f.type === "slug" && f.from === name);
      if (slugField && isNew && (!e[slugField.name] || e[slugField.name] === slugify(String(e[name] ?? "")))) {
        next[slugField.name] = slugify(String(value));
      }
      return next;
    });

  function save() {
    if (!editing) return;
    const { id, created_at: _c, ...data } = editing;
    void _c;
    start(async () => {
      const res = await saveRecord(table, isNew ? null : id, data);
      if (res.ok) {
        setMsg({ type: "ok", text: "Salvo com sucesso!" });
        setEditing(null);
        router.refresh();
      } else setMsg({ type: "err", text: res.error });
    });
  }

  function remove(r: Row) {
    if (!confirm(`Excluir "${r[cfg.titleKey]}"? Esta ação não pode ser desfeita.`)) return;
    start(async () => {
      const res = await deleteRecord(table, r.id);
      setMsg(res.ok ? { type: "ok", text: "Excluído." } : { type: "err", text: res.error });
      if (res.ok) router.refresh();
    });
  }

  function togglePublish(r: Row) {
    if (!cfg.publishKey) return;
    const { id, created_at: _c, ...data } = r;
    void _c;
    start(async () => {
      const res = await saveRecord(table, id, { ...data, [cfg.publishKey!]: !r[cfg.publishKey!] });
      if (res.ok) router.refresh();
      else setMsg({ type: "err", text: res.error });
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="text-sm text-mute">{rows.length} cadastrado(s)</p>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="field !w-40 !py-2.5 sm:!w-56" aria-label="Buscar" />
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple to-green px-5 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Novo {cfg.singular}
          </button>
        </div>
      </div>

      {msg && !editing && (
        <p role="status" className={`mb-4 rounded-xl px-4 py-3 text-sm ring-1 ${msg.type === "ok" ? "bg-green/10 text-green ring-green/30" : "bg-red-500/10 text-red-200 ring-red-400/30"}`}>
          {msg.text}
        </p>
      )}

      <ul className="space-y-2">
        {list.map((r) => {
          const published = cfg.publishKey ? Boolean(r[cfg.publishKey]) : true;
          const img = cfg.imageKey ? String(r[cfg.imageKey] || "") : "";
          return (
            <li key={r.id} className={`glass flex items-center gap-4 rounded-2xl p-3 pr-4 ${published ? "" : "opacity-55"}`}>
              <GripVertical className="hidden h-4 w-4 text-white/20 sm:block" />
              <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-purple/40 to-green/20 text-sm font-bold">
                {img && /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(img) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-full w-full object-cover" />
                ) : (
                  String(r[cfg.titleKey] ?? "?").charAt(0)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  <span className="truncate">{String(r[cfg.titleKey] ?? "")}</span>
                  {Boolean(r.featured) && <Star className="h-3.5 w-3.5 fill-green text-green" aria-label="Destaque" />}
                  {Boolean(r.is_example) && <span className="rounded bg-amber-300/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-amber-200">Exemplo</span>}
                </p>
                <p className="truncate text-xs text-mute">{cfg.subtitle(r)}</p>
              </div>
              {cfg.publishKey && (
                <button type="button" onClick={() => togglePublish(r)} disabled={pending} title={published ? "Ocultar do site" : "Publicar no site"} aria-label={published ? "Ocultar do site" : "Publicar no site"} className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-white/10 hover:text-white">
                  {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              )}
              <button type="button" onClick={() => openEdit(r)} aria-label="Editar" className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-white/10 hover:text-white">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => remove(r)} disabled={pending} aria-label="Excluir" className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-red-500/15 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
        {!list.length && <li className="glass rounded-2xl p-8 text-center text-mute">Nada por aqui ainda.</li>}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="editor-title" onKeyDown={(e) => e.key === "Escape" && setEditing(null)}>
          <div className="flex h-full w-full max-w-3xl flex-col bg-ink-2 shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 id="editor-title" className="font-display text-xl font-bold">
                {isNew ? `Novo ${cfg.singular}` : `Editar ${cfg.singular}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {cfg.fields.map((f) => (
                  <FieldInput key={f.name} field={f} value={editing[f.name]} onChange={(v) => set(f.name, v)} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/5 px-6 py-4">
              <p className="text-sm" role="status">
                {msg?.type === "err" && <span className="text-red-300">{msg.text}</span>}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/10">
                  Cancelar
                </button>
                <button type="button" onClick={save} disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple to-green px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${field.name}`;
  const wrap = field.full || field.type === "textarea" ? "sm:col-span-2" : "";
  const label = (
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/90">
      {field.label}
    </label>
  );
  const help = field.help ? <p className="mt-1.5 text-xs text-mute">{field.help}</p> : null;

  switch (field.type) {
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#39d6a0]" />
          {field.label}
        </label>
      );
    case "textarea":
      return (
        <div className={wrap}>
          {label}
          <textarea id={id} rows={field.name === "description" ? 6 : 3} className="field resize-y" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
    case "number":
      return (
        <div className={wrap}>
          {label}
          <input id={id} type="number" className="field" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} />
          {help}
        </div>
      );
    case "select":
      return (
        <div className={wrap}>
          {label}
          <select id={id} className="field" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {help}
        </div>
      );
    case "slug":
      return (
        <div className={wrap}>
          {label}
          <input id={id} className="field font-mono text-sm" value={String(value ?? "")} onChange={(e) => onChange(slugify(e.target.value))} />
          {help}
        </div>
      );
    case "upload":
      return (
        <div className={wrap}>
          {label}
          <UploadField id={id} value={String(value ?? "")} onChange={onChange} accept={field.accept} />
          {help}
        </div>
      );
    case "items":
      return (
        <div className={wrap}>
          <span className="mb-2 block text-sm font-semibold text-white/90">{field.label}</span>
          <ItemsEditor value={(value as ServiceItem[]) ?? []} onChange={onChange} />
          {help}
        </div>
      );
    case "gallery":
      return (
        <div className={wrap}>
          <span className="mb-2 block text-sm font-semibold text-white/90">{field.label}</span>
          <GalleryEditor value={(value as string[]) ?? []} onChange={onChange} />
        </div>
      );
    default:
      return (
        <div className={wrap}>
          {label}
          <input id={id} className="field" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
          {help}
        </div>
      );
  }
}

function ItemsEditor({ value, onChange }: { value: ServiceItem[]; onChange: (v: ServiceItem[]) => void }) {
  const update = (i: number, patch: Partial<ServiceItem>) => onChange(value.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {value.map((it, i) => (
        <div key={i} className="grid gap-2 rounded-xl bg-white/5 p-3 sm:grid-cols-[1.3fr_1.5fr_1fr_auto]">
          <input className="field !py-2 text-sm" placeholder="Nome" value={it.name} onChange={(e) => update(i, { name: e.target.value })} aria-label={`Nome do item ${i + 1}`} />
          <input className="field !py-2 text-sm" placeholder="Descrição (opcional)" value={it.description ?? ""} onChange={(e) => update(i, { description: e.target.value })} aria-label={`Descrição do item ${i + 1}`} />
          <input className="field !py-2 text-sm" placeholder="Preço: ex. R$ 250" value={it.price ?? ""} onChange={(e) => update(i, { price: e.target.value })} aria-label={`Preço do item ${i + 1}`} />
          <div className="flex gap-1">
            <button type="button" onClick={() => move(i, -1)} className="h-9 w-8 rounded-lg bg-white/5 text-xs hover:bg-white/10" aria-label="Mover para cima">↑</button>
            <button type="button" onClick={() => move(i, 1)} className="h-9 w-8 rounded-lg bg-white/5 text-xs hover:bg-white/10" aria-label="Mover para baixo">↓</button>
            <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-mute hover:text-red-300" aria-label="Remover item">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { name: "", description: "", price: "" }])} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-green ring-1 ring-green/40 hover:bg-green/10">
        <Plus className="h-4 w-4" /> Adicionar item
      </button>
    </div>
  );
}

function GalleryEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [adding, setAdding] = useState("");
  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((src, i) => (
            <li key={src + i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-28 rounded-lg object-cover ring-1 ring-white/10" />
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white" aria-label="Remover imagem">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <UploadField
        id="gallery-add"
        value={adding}
        onChange={(v) => {
          if (v) {
            onChange([...value, v]);
            setAdding("");
          }
        }}
        accept="image/*"
        allowText={false}
        placeholder="Envie uma imagem para adicionar à galeria"
      />
    </div>
  );
}
