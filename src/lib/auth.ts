import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/db";
import { supabaseAdmin } from "@/lib/db/supabase-driver";
import { sessionSecret } from "@/lib/env";

export const SESSION_COOKIE = "hp_admin";
const SESSION_HOURS = 8;

async function secretKey() {
  const key = await sessionSecret();
  if (!key) throw new Error("Segredo de sessão indisponível: defina AUTH_SECRET ou configure o Supabase.");
  return key;
}

export async function createSessionToken(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(await secretKey());
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || !payload.sub) return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Use em páginas e server actions do painel. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

function decodeHash(raw: string) {
  const v = (raw || "").trim();
  return v.startsWith("b64:") ? Buffer.from(v.slice(4), "base64").toString("utf8") : v;
}

/**
 * Credenciais do administrador.
 * 1º) variáveis ADMIN_EMAIL + ADMIN_PASSWORD_HASH;
 * 2º) linha "admin" da tabela settings no Supabase (nunca exposta ao público — o site só lê a linha "main").
 * O hash aceita o formato "b64:..." ou o hash bcrypt puro.
 */
export async function getAdminCredentials(): Promise<{ email: string; hash: string } | null> {
  const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const envHash = decodeHash(process.env.ADMIN_PASSWORD_HASH || "");
  if (envEmail && envHash) return { email: envEmail, hash: envHash };
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabaseAdmin().from("settings").select("data").eq("id", "admin").maybeSingle();
    const d = (data?.data ?? {}) as { email?: string; passwordHash?: string };
    if (d.email && d.passwordHash) return { email: d.email.trim().toLowerCase(), hash: decodeHash(d.passwordHash) };
  } catch (err) {
    console.error("[auth] falha ao ler credenciais do banco:", err);
  }
  return null;
}

export async function isAuthConfigured() {
  return Boolean((await sessionSecret()) && (await getAdminCredentials()));
}
