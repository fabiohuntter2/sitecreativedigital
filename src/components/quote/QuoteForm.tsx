"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, Copy, FileUp, Loader2, Paperclip, Send, X } from "lucide-react";
import { submitQuote, type QuoteResult } from "@/app/actions/quote";
import { Button } from "@/components/ui/Primitives";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { uploadFile, type UploadResult } from "@/lib/upload-client";

type ServiceOpt = { slug: string; title: string; items: string[] };

const MAX_FILES = 5;
const MAX_MB = 25;

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 13);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
}

export function QuoteForm({ services }: { services: ServiceOpt[] }) {
  const [service, setService] = useState("");
  const [sameWhats, setSameWhats] = useState(true);
  const [phone, setPhone] = useState("");
  const [whats, setWhats] = useState("");
  const [files, setFiles] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<Extract<QuoteResult, { ok: true }> | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("servico");
    const found = services.find((s) => s.slug === slug);
    if (found) setService(found.title);
  }, [services]);

  useEffect(() => {
    if (result) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const items = useMemo(() => services.find((s) => s.title === service)?.items ?? [], [service, services]);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setUploadErr("");
    const chosen = Array.from(list).slice(0, MAX_FILES - files.length);
    const tooBig = chosen.find((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig) {
      setUploadErr(`"${tooBig.name}" ultrapassa ${MAX_MB} MB. Envie um link (Google Drive, WeTransfer etc.) no campo de referências.`);
      return;
    }
    setUploading(true);
    try {
      for (const f of chosen) {
        const up = await uploadFile(f, "quote");
        setFiles((prev) => [...prev, up]);
      }
    } catch (e) {
      setUploadErr((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErrors({});
    setFormError("");
    start(async () => {
      const res = await submitQuote({
        service,
        subservice: String(fd.get("subservice") || ""),
        name: String(fd.get("name") || ""),
        phone,
        whatsapp: sameWhats ? "" : whats,
        email: String(fd.get("email") || ""),
        description: String(fd.get("description") || ""),
        deadline: String(fd.get("deadline") || ""),
        budget: String(fd.get("budget") || ""),
        references: String(fd.get("references") || ""),
        attachments: files,
        website: String(fd.get("website") || ""),
        consent: fd.get("consent") === "on" ? true : (false as unknown as true),
      });
      if (res.ok) {
        setResult(res);
        // tenta abrir o WhatsApp automaticamente (alguns navegadores bloqueiam; o botão fica disponível)
        window.open(res.whatsappUrl, "_blank", "noopener,noreferrer");
      } else {
        setErrors(res.fields ?? {});
        setFormError(res.error);
      }
    });
  }

  if (result) {
    return (
      <div ref={topRef} className="glass rounded-[2rem] p-8 text-center sm:p-12" role="status">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green" />
        <h2 className="mt-5 font-display text-3xl font-bold">Solicitação registrada!</h2>
        <p className="mt-3 text-mute">
          Protocolo <strong className="text-white">{result.protocol}</strong>. Para agilizar, envie a mensagem abaixo pelo WhatsApp — ela já está pronta e organizada.
        </p>
        <pre className="mx-auto mt-6 max-h-72 max-w-xl overflow-auto whitespace-pre-wrap rounded-2xl bg-ink/70 p-5 text-left text-sm text-white/80 ring-1 ring-white/10">
          {result.message}
        </pre>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-7 py-4 font-semibold text-[#062b16] transition hover:-translate-y-0.5"
          >
            <WhatsAppIcon /> Enviar pelo WhatsApp
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(result.message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 font-semibold transition hover:bg-white/10"
          >
            <Copy className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar mensagem"}
          </button>
        </div>
        <button type="button" onClick={() => { setResult(null); setFiles([]); }} className="mt-6 text-sm text-mute underline-offset-4 hover:underline">
          Fazer outra solicitação
        </button>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-1.5 text-xs text-red-300">
        {errors[k]}
      </p>
    ) : null;
  const label = "mb-2 block text-sm font-semibold text-white/90";

  return (
    <form ref={topRef as unknown as React.RefObject<HTMLFormElement>} onSubmit={onSubmit} noValidate className="glass space-y-6 rounded-[2rem] p-6 sm:p-10">
      {formError && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/30">
          {formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className={label}>Serviço *</label>
          <select id="service" className="field" value={service} onChange={(e) => setService(e.target.value)} aria-invalid={!!errors.service} aria-describedby="service-err" required>
            <option value="">Selecione…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>{s.title}</option>
            ))}
            <option value="Outro">Outro / não sei ainda</option>
          </select>
          {err("service")}
        </div>
        <div>
          <label htmlFor="subservice" className={label}>Tipo de projeto</label>
          <select id="subservice" name="subservice" className="field" disabled={!items.length} defaultValue="">
            <option value="">{items.length ? "Selecione (opcional)" : "—"}</option>
            {items.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="name" className={label}>Nome completo *</label>
        <input id="name" name="name" className="field" autoComplete="name" required maxLength={100} aria-invalid={!!errors.name} aria-describedby="name-err" />
        {err("name")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={label}>Telefone com DDD *</label>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(98) 99999-9999" aria-invalid={!!errors.phone} aria-describedby="phone-err" required />
          {err("phone")}
          <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-sm text-mute">
            <input type="checkbox" checked={sameWhats} onChange={(e) => setSameWhats(e.target.checked)} className="h-4 w-4 accent-[#39d6a0]" />
            Este número também é WhatsApp
          </label>
        </div>
        <div>
          <label htmlFor="whatsapp" className={label}>WhatsApp</label>
          <input id="whatsapp" type="tel" inputMode="tel" className="field" value={sameWhats ? phone : whats} onChange={(e) => setWhats(maskPhone(e.target.value))} disabled={sameWhats} placeholder="(98) 99999-9999" aria-invalid={!!errors.whatsapp} aria-describedby="whatsapp-err" />
          {err("whatsapp")}
        </div>
      </div>

      <div>
        <label htmlFor="email" className={label}>E-mail (opcional)</label>
        <input id="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} aria-describedby="email-err" />
        {err("email")}
      </div>

      <div>
        <label htmlFor="description" className={label}>Descreva seu projeto *</label>
        <textarea id="description" name="description" rows={5} maxLength={3000} className="field resize-y" placeholder="Conte o que você precisa, objetivo, quantidade, estilo, onde será usado…" aria-invalid={!!errors.description} aria-describedby="description-err" required />
        {err("description")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="deadline" className={label}>Prazo desejado</label>
          <select id="deadline" name="deadline" className="field" defaultValue="">
            <option value="">Sem prazo definido</option>
            <option>Urgente (até 7 dias)</option>
            <option>Até 15 dias</option>
            <option>Até 30 dias</option>
            <option>Mais de 30 dias</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className={label}>Investimento previsto</label>
          <select id="budget" name="budget" className="field" defaultValue="">
            <option value="">Prefiro conversar</option>
            <option>Até R$ 500</option>
            <option>R$ 500 a R$ 1.500</option>
            <option>R$ 1.500 a R$ 5.000</option>
            <option>Acima de R$ 5.000</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="references" className={label}>Referências (links)</label>
        <textarea id="references" name="references" rows={2} maxLength={1500} className="field resize-y" placeholder="Links de músicas, vídeos, sites ou perfis que você gosta" />
      </div>

      <div>
        <span className={label}>Arquivos de referência (opcional)</span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFiles(e.dataTransfer.files);
          }}
          className="rounded-2xl border border-dashed border-white/15 bg-ink/40 p-5 text-center"
        >
          <FileUp className="mx-auto h-8 w-8 text-purple-soft" />
          <p className="mt-2 text-sm text-mute">
            Arraste aqui ou{" "}
            <button type="button" onClick={() => fileInput.current?.click()} className="font-semibold text-green underline-offset-4 hover:underline" disabled={uploading || files.length >= MAX_FILES}>
              escolha arquivos
            </button>
          </p>
          <p className="mt-1 text-xs text-white/40">Imagens, áudios, vídeos curtos, PDF · até {MAX_FILES} arquivos de {MAX_MB} MB</p>
          <input ref={fileInput} type="file" multiple hidden accept="image/*,audio/*,video/*,application/pdf" onChange={(e) => onFiles(e.target.files)} />
          {uploading && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-green">
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
            </p>
          )}
          {uploadErr && <p role="alert" className="mt-3 text-sm text-red-300">{uploadErr}</p>}
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={f.url} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                <Paperclip className="h-4 w-4 text-green" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-mute">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => setFiles((p) => p.filter((_, k) => k !== i))} aria-label={`Remover ${f.name}`} className="text-mute hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* honeypot — invisível para pessoas */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Não preencha</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-mute">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#39d6a0]" required />
        <span>Autorizo o contato pelos dados informados para receber o orçamento. Seus dados não serão compartilhados com terceiros.</span>
      </label>
      {err("consent")}

      <Button type="submit" disabled={pending || uploading} className="w-full py-4 text-base">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {pending ? "Enviando…" : "Gerar orçamento e enviar pelo WhatsApp"}
      </Button>
    </form>
  );
}
