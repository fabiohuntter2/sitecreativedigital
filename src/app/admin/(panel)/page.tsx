import Link from "next/link";
import { AlertTriangle, ArrowRight, Briefcase, Database, Film, Inbox, MessageSquareQuote } from "lucide-react";
import { db, isSupabaseConfigured } from "@/lib/db";
import { QUOTE_STATUS } from "@/lib/constants";

export default async function AdminHome() {
  const d = db();
  const [quotes, services, portfolio, media, testimonials] = await Promise.all([
    d.list("quotes"),
    d.list("services"),
    d.list("portfolio"),
    d.list("media"),
    d.list("testimonials"),
  ]);
  const novos = quotes.filter((q) => q.status === "novo").length;
  const examples = [...portfolio, ...media, ...testimonials].filter((x) => x.is_example).length;

  const stats = [
    { href: "/admin/orcamentos", label: "Orçamentos novos", value: novos, Icon: Inbox },
    { href: "/admin/servicos", label: "Serviços", value: services.length, Icon: Briefcase },
    { href: "/admin/portfolio", label: "Projetos no portfólio", value: portfolio.length, Icon: Database },
    { href: "/admin/midias", label: "Músicas e vídeos", value: media.length, Icon: Film },
    { href: "/admin/depoimentos", label: "Depoimentos", value: testimonials.length, Icon: MessageSquareQuote },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Visão geral</h1>
        <p className="text-mute">Gerencie todo o conteúdo do site por aqui.</p>
      </div>

      {!isSupabaseConfigured() && (
        <p className="flex gap-3 rounded-2xl bg-amber-300/10 p-4 text-sm text-amber-100 ring-1 ring-amber-300/30">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Modo local: os dados ficam no arquivo <code>data/db.json</code> e os envios em <code>data/uploads</code>. Para publicar na internet em hospedagem serverless (Vercel), configure o Supabase — veja o README.</span>
        </p>
      )}
      {examples > 0 && (
        <p className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm text-white/80 ring-1 ring-white/10">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-200" />
          <span>Existem {examples} conteúdos marcados como EXEMPLO. Substitua-os por trabalhos e depoimentos reais antes de divulgar o site.</span>
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ href, label, value, Icon }) => (
          <li key={href}>
            <Link href={href} className="glass block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-purple/50">
              <Icon className="h-6 w-6 text-green" />
              <p className="mt-4 font-display text-3xl font-bold">{value}</p>
              <p className="text-sm text-mute">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Últimas solicitações</h2>
          <Link href="/admin/orcamentos" className="inline-flex items-center gap-1 text-sm text-green hover:underline">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {quotes.length ? (
          <ul className="divide-y divide-white/5">
            {quotes.slice(0, 6).map((q) => {
              const st = QUOTE_STATUS.find((s) => s.value === q.status);
              return (
                <li key={q.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <span className="font-mono text-xs text-mute">{q.protocol}</span>
                  <span className="font-semibold">{q.name}</span>
                  <span className="text-mute">{q.service}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${st?.color}`}>{st?.label}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-mute">Nenhuma solicitação recebida ainda.</p>
        )}
      </section>
    </div>
  );
}
