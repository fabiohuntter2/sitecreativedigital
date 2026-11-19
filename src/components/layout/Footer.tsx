import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SocialLinks } from "@/components/ui/SocialIcons";
import type { Service, Settings } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

export function Footer({ settings, services }: { settings: Settings; services: Service[] }) {
  const year = new Date().getFullYear();
  const { contact } = settings;
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/5 bg-ink-2">
      <div aria-hidden="true" className="absolute -bottom-40 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-purple/15 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo logoUrl={settings.site.logoUrl} />
          <p className="text-sm leading-relaxed text-mute">{settings.site.footerText}</p>
          <SocialLinks settings={settings} />
        </div>

        <div>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white/90">Serviços</h2>
          <ul className="space-y-2.5 text-sm text-mute">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/servicos/${s.slug}`} className="transition hover:text-green">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white/90">Navegação</h2>
          <ul className="space-y-2.5 text-sm text-mute">
            {[
              ["/portfolio", "Portfólio"],
              ["/experimente", "Experimente nosso trabalho"],
              ["/sobre", "Sobre a empresa"],
              ["/orcamento", "Solicitar orçamento"],
              ["/contato", "Contato"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-green">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-white/90">Contato</h2>
          <ul className="space-y-3 text-sm text-mute">
            <li>
              <a href={waLink(contact.whatsapp, contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 transition hover:text-green">
                <Phone className="h-4 w-4 text-green" /> {contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 break-all transition hover:text-green">
                <Mail className="h-4 w-4 shrink-0 text-green" /> {contact.email}
              </a>
            </li>
            {contact.city && (
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-green" /> {contact.city}
              </li>
            )}
            {contact.hours && (
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-green" /> {contact.hours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-white/40 sm:flex-row sm:px-8">
          <p>© {year} {settings.site.name}. Todos os direitos reservados.</p>
          <p className="italic">{settings.site.slogan}</p>
        </div>
      </div>
    </footer>
  );
}
