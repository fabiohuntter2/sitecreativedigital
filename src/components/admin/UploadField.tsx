"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";

export function UploadField({
  id,
  value,
  onChange,
  accept = "image/*",
  placeholder = "Cole um link ou envie um arquivo",
  allowText = true,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  accept?: string;
  placeholder?: string;
  allowText?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const isImage = /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(value);
  const isAudio = /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(value);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(value);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const up = await uploadFile(file, "admin");
      onChange(up.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {allowText ? (
          <input id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        ) : (
          <span className="flex flex-1 items-center text-sm text-mute">{placeholder}</span>
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-purple/30 px-4 text-sm font-semibold ring-1 ring-purple/50 transition hover:bg-purple/50 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="hidden sm:inline">{busy ? "Enviando" : "Enviar"}</span>
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label="Remover arquivo" className="grid w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-mute hover:text-red-300">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <input ref={input} type="file" hidden accept={accept} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-1.5 text-xs text-red-300">{err}</p>}
      {value && (
        <div className="mt-2">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pré-visualização" className="h-24 rounded-lg object-cover ring-1 ring-white/10" />
          )}
          {isAudio && <audio src={value} controls preload="none" className="h-10 w-full max-w-sm" />}
          {isVideo && <video src={value} controls preload="metadata" className="h-28 rounded-lg" />}
        </div>
      )}
    </div>
  );
}
