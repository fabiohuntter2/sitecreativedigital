import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { ServiceIcon } from "@/components/ui/Icon";
import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import type { Service } from "@/lib/types";
import { serviceWhatsappMessage, waLink } from "@/lib/whatsapp";

export function ServiceCard({ service, whatsapp, index = 0 }: { service: Service; whatsapp: string; index?: number }) {
  return (
    <article
      className="glow-card glass reveal group flex h-full flex-col rounded-3xl p-7 transition duration-500 hover:-translate-y-1.5"
      style={{ "--d": `${index * 70}ms` } as React.CSSProperties}
    >
      <span className="spot" aria-hidden="true" />
      <div className="mb-6 flex items-start justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-purple/40 to-green/20 text-white ring-1 ring-white/10 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
          <ServiceIcon name={service.icon} className="h-7 w-7" />
        </span>
        <span className="font-display text-sm font-bold text-white/20">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="font-display text-xl font-bold">
        <Link href={`/servicos/${service.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {service.title}
        </Link>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-mute">{service.short_description}</p>
      <ul className="mt-5 space-y-2 text-sm text-white/80">
        {service.items.slice(0, 4).map((it) => (
          <li key={it.name} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" /> {it.name}
          </li>
        ))}
        {service.items.length > 4 && <li className="pl-6 text-xs text-mute">+ {service.items.length - 4} serviços</li>}
      </ul>
      {service.price_label && <p className="mt-5 text-sm font-semibold text-green">{service.price_label}</p>}
      <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-7">
        <a
          href={waLink(whatsapp, serviceWhatsappMessage(service.title, service.whatsapp_message))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25d366]/15 px-4 py-2 text-xs font-semibold text-[#5ef08f] ring-1 ring-[#25d366]/30 transition hover:bg-[#25d366] hover:text-[#062b16]"
        >
          <WhatsAppIcon className="h-4 w-4" /> Orçamento
        </a>
        <Link
          href={`/servicos/${service.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
        >
          Ver detalhes <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
