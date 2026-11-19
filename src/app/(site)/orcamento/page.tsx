import type { Metadata } from "next";
import { Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { PageHero } from "@/components/ui/Primitives";
import { getServices, getSettings } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Solicitar Orçamento",
  description: "Peça um orçamento de criação de sites, gravação, mixagem, produção musical, videoclipes, vídeos e marketing digital.",
  alternates: { canonical: "/orcamento" },
};

export default async function QuotePage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <PageHero
        eyebrow="Orçamento"
        title={<>Conte sua ideia. <span className="text-gradient">A gente dá vida a ela.</span></>}
        text="Preencha o formulário: geramos uma mensagem organizada para você enviar pelo WhatsApp e registramos seu pedido."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-10 sm:px-8 lg:grid-cols-[1fr_340px]">
        <div className="reveal">
          <QuoteForm services={services.map((s) => ({ slug: s.slug, title: s.title, items: s.items.map((i) => i.name) }))} />
        </div>
        <aside className="space-y-4">
          {[
            { Icon: MessageCircle, t: "Resposta pelo WhatsApp", d: "Você conversa direto com a equipe, sem intermediários." },
            { Icon: Clock, t: "Orçamento personalizado", d: "Cada projeto é avaliado conforme sua necessidade." },
            { Icon: ShieldCheck, t: "Seus dados protegidos", d: "Usados apenas para responder à sua solicitação." },
          ].map(({ Icon, t, d }, i) => (
            <div key={t} className="glass reveal rounded-2xl p-5" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <Icon className="h-6 w-6 text-green" />
              <p className="mt-3 font-display font-semibold">{t}</p>
              <p className="mt-1 text-sm text-mute">{d}</p>
            </div>
          ))}
          <a
            href={waLink(settings.contact.whatsapp, settings.contact.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="reveal block rounded-2xl bg-[#25d366]/10 p-5 text-sm ring-1 ring-[#25d366]/30 transition hover:bg-[#25d366]/20"
          >
            Prefere conversar direto? <strong className="text-[#5ef08f]">Chame no WhatsApp {settings.contact.whatsappDisplay}</strong>
          </a>
        </aside>
      </section>
    </>
  );
}
