/**
 * Limitador simples em memória (por instância do servidor).
 * Protege login e formulários contra abuso básico. Para alto tráfego,
 * troque por um serviço compartilhado (ex.: Upstash Redis).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  b.count += 1;
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  }
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count) };
}

export async function clientIp(headersPromise: Promise<Headers> | Headers) {
  const h = await headersPromise;
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}
