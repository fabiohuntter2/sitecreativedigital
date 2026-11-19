import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SignJWT } from "jose";
import { sessionSecret } from "@/lib/env";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ADMIN_MAX_BYTES, PUBLIC_MAX_BYTES, createUploadTarget, isAllowedType } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(120),
  size: z.number().int().positive(),
  scope: z.enum(["admin", "quote"]),
});

/** Prepara um upload: valida tipo/tamanho/permissão e devolve o destino. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { name, type, size, scope } = parsed.data;

  if (!isAllowedType(type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 415 });
  }

  if (scope === "admin") {
    if (!(await getSession())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (size > ADMIN_MAX_BYTES) return NextResponse.json({ error: "Arquivo acima de 500 MB" }, { status: 413 });
  } else {
    const ip = await clientIp(headers());
    if (!rateLimit(`upload:${ip}`, 12, 15 * 60_000).ok) {
      return NextResponse.json({ error: "Muitos envios. Tente novamente em alguns minutos." }, { status: 429 });
    }
    if (size > PUBLIC_MAX_BYTES) return NextResponse.json({ error: "Cada arquivo pode ter no máximo 25 MB" }, { status: 413 });
  }

  try {
    const folder = scope === "admin" ? "site" : "orcamentos";
    const target = await createUploadTarget(folder, name);
    if (target.mode === "local") {
      // token curto que autoriza somente este caminho e este tamanho
      const token = await new SignJWT({ path: target.path, max: size })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("15m")
        .sign((await sessionSecret())!);
      target.uploadUrl += `&token=${encodeURIComponent(token)}`;
    }
    return NextResponse.json(target);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível preparar o envio" }, { status: 500 });
  }
}
