import type { Settings, TableMap, TableName } from "@/lib/types";
import { supabaseServiceKey, supabaseUrl } from "@/lib/env";
import { jsonDriver } from "./json-driver";
import { supabaseDriver } from "./supabase-driver";

export interface DbDriver {
  readonly mode: "supabase" | "local";
  list<T extends TableName>(table: T): Promise<TableMap[T][]>;
  get<T extends TableName>(table: T, id: string): Promise<TableMap[T] | null>;
  findBy<T extends TableName>(table: T, field: string, value: string): Promise<TableMap[T] | null>;
  insert<T extends TableName>(table: T, data: Partial<TableMap[T]>): Promise<TableMap[T]>;
  update<T extends TableName>(table: T, id: string, data: Partial<TableMap[T]>): Promise<TableMap[T]>;
  remove(table: TableName, id: string): Promise<void>;
  getSettings(): Promise<Partial<Settings> | null>;
  saveSettings(settings: Settings): Promise<void>;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseServiceKey());
}

export function db(): DbDriver {
  return isSupabaseConfigured() ? supabaseDriver() : jsonDriver();
}

/** Ordenação padrão por tabela */
export function sortRows<T extends TableName>(table: T, rows: TableMap[T][]): TableMap[T][] {
  const copy = [...rows];
  if (table === "quotes") {
    return copy.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
  }
  return copy.sort((a, b) => {
    const sa = (a as { sort_order?: number }).sort_order ?? 0;
    const sb = (b as { sort_order?: number }).sort_order ?? 0;
    if (sa !== sb) return sa - sb;
    return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
  });
}
