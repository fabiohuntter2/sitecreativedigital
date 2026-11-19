"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { adminPasswordHash, clearSessionCookie, createSessionToken, isAuthConfigured, requireAdmin, setSessionCookie } from "@/lib/auth";
import { schemas, settingsSchema, type EditableTable } from "@/lib/admin-schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { QuoteStatus, Settings } from "@/lib/types";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/* ---------------------------- autenticação ---------------------------- */

export async function loginAction(_: unknown, formData: FormData): Promise<{ error: string } | undefined> {
  if (!isAuthConfigured()) {
    return { error: "Login não configurado. Defina ADMIN_EMAIL, ADMIN_PASSWORD_HASH e AUTH_SECRET (veja o README)." };
  }
  const ip = await clientIp(headers());
  if (!rateLimit(`login:${ip}`, 6, 15 * 60_000).ok) {
    return { error: "Muitas tentativas. Aguarde 15 minutos." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const expectedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  // compara sempre o hash (mesmo com e-mail errado) para não revelar quais e-mails existem
  const passOk = await bcrypt.compare(password, adminPasswordHash()).catch(() => false);
  if (!passOk || email !== expectedEmail) {
    return { error: "E-mail ou senha incorretos." };
  }
  await setSessionCookie(await createSessionToken(email));
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ------------------------------ conteúdo ------------------------------ */

function refreshSite() {
  revalidatePath("/", "layout");
}

export async function saveRecord(table: EditableTable, id: string | null, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  const schema = schemas[table];
  if (!schema) return { ok: false, error: "Tabela inválida" };
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${String(i.path.join("."))}: ${i.message}` };
  }
  const values = parsed.data as Record<string, unknown>;

  // slug único
  if ("slug" in values) {
    const existing = await db().findBy(table, "slug", String(values.slug));
    if (existing && existing.id !== id) return { ok: false, error: "Já existe um item com este endereço (slug)." };
  }

  try {
    const row = id ? await db().update(table, id, values as never) : await db().insert(table, values as never);
    refreshSite();
    return { ok: true, id: row.id };
  } catch (err) {
    console.error(err);
    return { ok: false, error: (err as Error).message || "Falha ao salvar" };
  }
}

export async function deleteRecord(table: EditableTable | "quotes", id: string): Promise<ActionResult> {
  await requireAdmin();
  if (![...Object.keys(schemas), "quotes"].includes(table)) return { ok: false, error: "Tabela inválida" };
  try {
    await db().remove(table, z.string().min(1).max(100).parse(id));
    refreshSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function saveSettingsAction(data: Settings): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i.message };
  }
  try {
    await db().saveSettings(parsed.data as Settings);
    refreshSite();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

const quoteUpdate = z.object({
  status: z.enum(["novo", "em_andamento", "respondido", "arquivado"]),
  notes: z.string().max(3000).default(""),
});

export async function updateQuoteAction(id: string, data: { status: QuoteStatus; notes: string }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = quoteUpdate.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  try {
    await db().update("quotes", id, parsed.data);
    revalidatePath("/admin/orcamentos");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
