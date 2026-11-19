import type { Metadata } from "next";
import { Clock, FileText, Mail, MapPin } from "lucide-react";
import { ButtonLink, PageHero } from "@/components/ui/Primitives";
import { SocialLinks, WhatsAppIcon } from "@/components/ui/SocialIcons";
import { getSettings } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Huntter Produções pelo WhatsApp, e-mail ou redes sociais.",
  alternates: { canonical: "/contato" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const { contact } = settings;
  const cards = [
    { Icon: WhatsAppIcon, t: "WhatsApp", v: contact.whatsappDisplay, href: waLink(contact.whatsapp, contact.whatsappMessage), ext: true },
    { Icon: Mail, t: "E-mail", v: contact.email, href: `mailto:${contact.email}`, ext: false },
    ...(contact.city ? [{ Icon: MapPin, t: "Localização", v: contact.city, href: "", ext: false }] : []),
    ...(contact.hours ? [{ Icon: Clock, t: "Atendimento", v: contact.hours, href: "", ext: false }] : []),
  ];
  return (
    <>
      <PageHero eyebrow="Contato" title={<>Vamos <span className="text-gradient">conversar?</span></>} text="Escolha o canal que preferir. Respondemos o mais rápido possível." />
      <section className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ Icon, t, v, href, ext }, i) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple/40 to-green/20 text-green">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-widest text-mute">{t}</span>
                  <span className="mt-1 block break-all font-display text-lg font-semibold">{v}</span>
                </span>
              </>
            );
            return href ? (
              <a key={t} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="glow-card glass reveal flex items-center gap-4 rounded-3xl p-6 transition hover:-translate-y-1" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
                <span className="spot" aria-hidden="true" />
                {inner}
              </a>
            ) : (
              <div key={t} className="glass reveal flex items-center gap-4 rounded-3xl p-6">{inner}</div>
            );
          })}
        </div>
        <div className="reveal mt-10 flex flex-col items-center gap-6 text-center">
          <p className="text-mute">Siga nas redes sociais</p>
          <SocialLinks settings={settings} className="justify-center" />
          <ButtonLink href="/orcamento" className="mt-4">
            <FileText className="h-4 w-4" /> Solicitar orçamento detalhado
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
