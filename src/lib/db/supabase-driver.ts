import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import seed from "@/data/seed.json";
import { supabaseServiceKey, supabaseUrl } from "@/lib/env";
import type { DbDriver } from "./index";
import { sortRows } from "./index";

let client: SupabaseClient | null = null;

/** Cliente com service role — usado SOMENTE no servidor. Nunca exponha essa chave no navegador. */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl(), supabaseServiceKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(`Supabase: ${error.message}`);
}

function strip(payload: Record<string, unknown>) {
  const rest = { ...payload };
  delete rest.id;
  delete rest.created_at;
  return rest;
}

/**
 * Preparação automática de um banco novo: na primeira leitura, se ainda não existir a configuração
 * principal, cria o bucket de arquivos e insere o conteúdo inicial (src/data/seed.json).
 * Só a requisição que conseguir criar a linha "main" faz a inserção — evita duplicar conteúdo.
 */
let seeding: Promise<void> | null = null;
function ensureSeeded(): Promise<void> {
  seeding ??= (async () => {
    const sb = supabaseAdmin();
    const { data: existing, error } = await sb.from("settings").select("id").eq("id", "main").maybeSingle();
    if (error || existing) return; // tabelas ausentes (erro aparecerá na consulta real) ou já preparado
    const { data: claimed } = await sb
      .from("settings")
      .upsert({ id: "main", data: seed.settings }, { onConflict: "id", ignoreDuplicates: true })
      .select("id");
    if (!claimed?.length) return; // outra requisição já está preparando
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
    const { error: bErr } = await sb.storage.getBucket(bucket);
    if (bErr) await sb.storage.createBucket(bucket, { public: true });
    for (const table of ["services", "portfolio", "media", "testimonials"] as const) {
      const { count } = await sb.from(table).select("*", { count: "exact", head: true });
      if (count) continue;
      const rows = (seed[table] as Record<string, unknown>[]).map(strip);
      const { error: insErr } = await sb.from(table).insert(rows);
      if (insErr) console.error(`[seed] ${table}:`, insErr.message);
    }
    console.log("[seed] banco preparado com o conteúdo inicial");
  })().catch((err) => {
    console.error("[seed] falha:", err);
    seeding = null;
  });
  return seeding;
}

let instance: DbDriver | null = null;

export function supabaseDriver(): DbDriver {
  if (instance) return instance;
  instance = {
    mode: "supabase",
    async list(table) {
      await ensureSeeded();
      const { data, error } = await supabaseAdmin().from(table).select("*");
      fail(error);
      return sortRows(table, (data ?? []) as never);
    },
    async get(table, id) {
      await ensureSeeded();
      const { data, error } = await supabaseAdmin().from(table).select("*").eq("id", id).maybeSingle();
      fail(error);
      return (data as never) ?? null;
    },
    async findBy(table, field, value) {
      await ensureSeeded();
      const { data, error } = await supabaseAdmin().from(table).select("*").eq(field, value).limit(1).maybeSingle();
      fail(error);
      return (data as never) ?? null;
    },
    async insert(table, payload) {
      const { data, error } = await supabaseAdmin()
        .from(table)
        .insert(strip(payload as Record<string, unknown>))
        .select("*")
        .single();
      fail(error);
      return data as never;
    },
    async update(table, id, payload) {
      const { data, error } = await supabaseAdmin()
        .from(table)
        .update(strip(payload as Record<string, unknown>))
        .eq("id", id)
        .select("*")
        .single();
      fail(error);
      return data as never;
    },
    async remove(table, id) {
      const { error } = await supabaseAdmin().from(table).delete().eq("id", id);
      fail(error);
    },
    async getSettings() {
      await ensureSeeded();
      const { data, error } = await supabaseAdmin().from("settings").select("data").eq("id", "main").maybeSingle();
      fail(error);
      return (data?.data as never) ?? null;
    },
    async saveSettings(settings) {
      const { error } = await supabaseAdmin()
        .from("settings")
        .upsert({ id: "main", data: settings, updated_at: new Date().toISOString() });
      fail(error);
    },
  };
  return instance;
}
