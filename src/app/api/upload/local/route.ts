import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { jwtVerify } from "jose";
import { sessionSecret } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/db";
import { resolveLocalPath } from "@/lib/storage";

/** Recebe o arquivo no modo de armazenamento local (sem Supabase). */
export async function PUT(req: Request) {
  if (isSupabaseConfigured()) return NextResponse.json({ error: "Armazenamento local desativado" }, { status: 404 });
  const url = new URL(req.url);
  const objectPath = url.searchParams.get("path") || "";
  const token = url.searchParams.get("token") || "";
  try {
    const { payload } = await jwtVerify(token, (await sessionSecret())!);
    if (payload.path !== objectPath) throw new Error("token");
    const buf = Buffer.from(await req.arrayBuffer());
    if (buf.length > Number(payload.max) + 1024) return NextResponse.json({ error: "Arquivo maior que o informado" }, { status: 413 });
    const full = resolveLocalPath(objectPath);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buf);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Envio não autorizado ou expirado" }, { status: 401 });
  }
}
