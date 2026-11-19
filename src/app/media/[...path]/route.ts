import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveLocalPath } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".aac": "audio/aac",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".pdf": "application/pdf", ".zip": "application/zip", ".txt": "text/plain; charset=utf-8",
};

/** Serve arquivos enviados no modo local, com suporte a Range (necessário para áudio/vídeo). */
export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  let full: string;
  try {
    full = resolveLocalPath(parts.map(decodeURIComponent).join("/"));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  let stat;
  try {
    stat = await fs.stat(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const ext = path.extname(full).toLowerCase();
  const type = TYPES[ext] || "application/octet-stream";
  const baseHeaders: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (ext === ".svg") baseHeaders["Content-Security-Policy"] = "script-src 'none'; sandbox";

  const range = req.headers.get("range");
  const fh = await fs.open(full, "r");
  try {
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m?.[1] ? Number(m[1]) : 0;
      let end = m?.[2] ? Number(m[2]) : stat.size - 1;
      if (!m?.[1] && m?.[2]) { start = stat.size - Number(m[2]); end = stat.size - 1; }
      end = Math.min(end, stat.size - 1);
      if (start > end || start >= stat.size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
      }
      const buf = Buffer.alloc(end - start + 1);
      await fh.read(buf, 0, buf.length, start);
      return new Response(new Uint8Array(buf), {
        status: 206,
        headers: { ...baseHeaders, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(buf.length) },
      });
    }
    const buf = await fh.readFile();
    return new Response(new Uint8Array(buf), { headers: { ...baseHeaders, "Content-Length": String(stat.size) } });
  } finally {
    await fh.close();
  }
}
