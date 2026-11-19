import path from "node:path";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/db";
import { supabaseAdmin } from "@/lib/db/supabase-driver";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";
export const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.LOCAL_UPLOAD_DIR)
  : path.join(process.cwd(), "data", "uploads");

export const ADMIN_MAX_BYTES = 500 * 1024 * 1024; // 500 MB (vídeos)
export const PUBLIC_MAX_BYTES = 25 * 1024 * 1024; // 25 MB por arquivo de referência

const ALLOWED_PREFIXES = ["image/", "audio/", "video/"];
const ALLOWED_EXACT = ["application/pdf", "application/zip", "application/x-zip-compressed", "text/plain"];

export function isAllowedType(type: string) {
  return ALLOWED_PREFIXES.some((p) => type.startsWith(p)) || ALLOWED_EXACT.includes(type);
}

export function safeFileName(name: string) {
  const ext = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 8);
  const base = path
    .basename(name, path.extname(name))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .toLowerCase();
  return `${base || "arquivo"}-${randomUUID().slice(0, 8)}${ext}`;
}

export type SignedUpload =
  | { mode: "supabase"; uploadUrl: string; publicUrl: string; path: string }
  | { mode: "local"; uploadUrl: string; publicUrl: string; path: string };

/** Gera um destino de upload. Supabase: URL assinada (upload direto do navegador). Local: rota interna. */
export async function createUploadTarget(folder: string, fileName: string): Promise<SignedUpload> {
  const objectPath = `${folder}/${new Date().getFullYear()}/${safeFileName(fileName)}`;
  if (isSupabaseConfigured()) {
    const sb = supabaseAdmin();
    const { data, error } = await sb.storage.from(STORAGE_BUCKET).createSignedUploadUrl(objectPath);
    if (error || !data) throw new Error(`Falha ao preparar upload: ${error?.message}`);
    const { data: pub } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
    return { mode: "supabase", uploadUrl: data.signedUrl, publicUrl: pub.publicUrl, path: objectPath };
  }
  return {
    mode: "local",
    uploadUrl: `/api/upload/local?path=${encodeURIComponent(objectPath)}`,
    publicUrl: `/media/${objectPath}`,
    path: objectPath,
  };
}

/** Resolve um caminho de upload local sem permitir saída da pasta (path traversal). */
export function resolveLocalPath(objectPath: string) {
  const full = path.resolve(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, objectPath);
  if (!full.startsWith(LOCAL_UPLOAD_DIR + path.sep)) throw new Error("Caminho inválido");
  return full;
}
