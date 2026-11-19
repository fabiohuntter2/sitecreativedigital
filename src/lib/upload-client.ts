"use client";

export type UploadResult = { url: string; name: string; size: number; type: string };

/** Envia um arquivo (navegador) para o Supabase Storage ou para o armazenamento local. */
export async function uploadFile(file: File, scope: "admin" | "quote"): Promise<UploadResult> {
  const type = file.type || "application/octet-stream";
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type, size: file.size, scope }),
  });
  const target = await res.json();
  if (!res.ok) throw new Error(target.error || "Falha ao preparar envio");

  let put: Response;
  if (target.mode === "supabase") {
    const form = new FormData();
    form.append("cacheControl", "31536000");
    form.append("", file);
    put = await fetch(target.uploadUrl, { method: "PUT", body: form, headers: { "x-upsert": "false" } });
  } else {
    put = await fetch(target.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": type } });
  }
  if (!put.ok) {
    const msg = await put.json().catch(() => ({}));
    throw new Error(msg.error || msg.message || "Falha ao enviar arquivo");
  }
  return { url: target.publicUrl, name: file.name, size: file.size, type };
}
