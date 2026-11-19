// Popula o Supabase com o conteúdo inicial (src/data/seed.json).
// Uso: npm run seed:supabase   (requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY)
// Só insere em tabelas vazias — não sobrescreve conteúdo existente.
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").replace(/\\\$/g, "$");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const seed = JSON.parse(readFileSync("src/data/seed.json", "utf8"));

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
const { error: bucketErr } = await sb.storage.getBucket(bucket);
if (bucketErr) {
  const { error } = await sb.storage.createBucket(bucket, { public: true });
  console.log(error ? `bucket ${bucket}: ${error.message}` : `bucket ${bucket}: criado (público)`);
} else console.log(`bucket ${bucket}: já existe`);

const { error: tableErr } = await sb.from("services").select("id").limit(1);
if (tableErr) {
  console.error("\nAs tabelas ainda não existem. Execute supabase/schema.sql no SQL Editor do Supabase e rode este comando de novo.");
  process.exit(1);
}

const { data: s } = await sb.from("settings").select("id").eq("id", "main").maybeSingle();
if (!s) {
  const { error } = await sb.from("settings").insert({ id: "main", data: seed.settings });
  console.log(error ? `settings: ${error.message}` : "settings: ok");
} else console.log("settings: já existe, mantido");

for (const table of ["services", "portfolio", "media", "testimonials"]) {
  const { count } = await sb.from(table).select("*", { count: "exact", head: true });
  if (count) {
    console.log(`${table}: já possui ${count} registro(s), mantido`);
    continue;
  }
  const rows = seed[table].map(({ id, ...rest }) => rest);
  const { error } = await sb.from(table).insert(rows);
  console.log(error ? `${table}: ${error.message}` : `${table}: ${rows.length} inserido(s)`);
}
console.log("\nPronto. Observação: as mídias de exemplo apontam para /demo/... (arquivos do próprio site).");
