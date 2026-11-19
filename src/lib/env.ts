/**
 * Leitura centralizada das variáveis de ambiente.
 * Aceita tanto os nomes usados pelo site quanto os criados pela integração Supabase da Vercel,
 * para que o deploy funcione sem precisar cadastrar variáveis manualmente.
 * Sem dependências do Node — funciona também no proxy.
 */

export function supabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
}

export function supabaseServiceKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
}

/**
 * Segredo que assina a sessão do painel.
 * Usa AUTH_SECRET quando existir; senão deriva um segredo da chave secreta do Supabase (HMAC-SHA256),
 * que só existe no servidor.
 */
let derived: Promise<Uint8Array | null> | null = null;
export function sessionSecret(): Promise<Uint8Array | null> {
  const explicit = (process.env.AUTH_SECRET || "").trim();
  if (explicit.length >= 32) return Promise.resolve(new TextEncoder().encode(explicit));
  derived ??= (async () => {
    const key = supabaseServiceKey();
    if (!key) return null;
    const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("huntter-admin-session-v1"));
    return new Uint8Array(sig);
  })();
  return derived;
}
