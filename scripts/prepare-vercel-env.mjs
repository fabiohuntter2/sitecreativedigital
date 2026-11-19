// Prepara a senha definitiva do painel e o arquivo .env.vercel (variáveis prontas para colar na Vercel).
// A senha chega pela variável de ambiente HP_NEW_PASSWORD (definida pelo comando PowerShell do README)
// e NUNCA é gravada em texto puro — só o hash bcrypt.
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const password = process.env.HP_NEW_PASSWORD || "";
const email = (process.env.HP_ADMIN_EMAIL || "fabiohuntter38@gmail.com").trim().toLowerCase();
const siteUrl = (process.env.HP_SITE_URL || "https://sitecreativedigital.vercel.app").replace(/\/$/, "");

if (password.length < 10) {
  console.error("\n❌ A senha precisa ter pelo menos 10 caracteres. Nada foi alterado.\n");
  process.exit(1);
}
if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
  console.error("\n❌ Use letras E números na senha. Nada foi alterado.\n");
  process.exit(1);
}

const localPath = ".env.local";
let local = readFileSync(localPath, "utf8").replace(/^﻿/, "");
const get = (k) => ((local.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1] || "").trim();
const supabaseUrl = get("NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseKey) {
  console.error("\n❌ Faltam as chaves do Supabase no .env.local.\n");
  process.exit(1);
}

const hash = "b64:" + Buffer.from(bcrypt.hashSync(password, 12)).toString("base64");
const authSecret = randomBytes(48).toString("base64url");

// 1) arquivo com as variáveis para a Vercel
writeFileSync(
  ".env.vercel",
  [
    `NEXT_PUBLIC_SITE_URL=${siteUrl}`,
    `ADMIN_EMAIL=${email}`,
    `ADMIN_PASSWORD_HASH=${hash}`,
    `AUTH_SECRET=${authSecret}`,
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `SUPABASE_SERVICE_ROLE_KEY=${supabaseKey}`,
    "",
  ].join("\n"),
  "utf8",
);

// 2) mesmo login no computador (remove a senha de teste)
local = local
  .split(/\r?\n/)
  .filter((l) => !/^#\s+(Login de teste|e-mail:|senha:|Credenciais de TESTE|npm run hash-password)/.test(l.trim()) && !/^#\s+(e-mail|senha):/.test(l))
  .join("\n")
  .replace(/^ADMIN_EMAIL=.*$/m, `ADMIN_EMAIL=${email}`)
  .replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`);
writeFileSync(localPath, local, "utf8");

console.log(`\n✅ Pronto!`);
console.log(`   Login do painel: ${email} + a senha que você acabou de criar`);
console.log(`   Arquivo para a Vercel: .env.vercel (6 variáveis)`);
console.log(`   A senha de teste foi removida do .env.local.\n`);
