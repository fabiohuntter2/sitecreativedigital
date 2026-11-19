import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DbDriver } from "./index";
import { sortRows } from "./index";

let client: SupabaseClient | null = null;

/** Cliente com service role — usado SOMENTE no servidor. Nunca exponha essa chave no navegador. */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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

let instance: DbDriver | null = null;

export function supabaseDriver(): DbDriver {
  if (instance) return instance;
  instance = {
    mode: "supabase",
    async list(table) {
      const { data, error } = await supabaseAdmin().from(table).select("*");
      fail(error);
      return sortRows(table, (data ?? []) as never);
    },
    async get(table, id) {
      const { data, error } = await supabaseAdmin().from(table).select("*").eq("id", id).maybeSingle();
      fail(error);
      return (data as never) ?? null;
    },
    async findBy(table, field, value) {
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
