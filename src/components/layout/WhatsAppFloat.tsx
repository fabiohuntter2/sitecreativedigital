import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { waLink } from "@/lib/whatsapp";

export function WhatsAppFloat({ number, message }: { number: string; message: string }) {
  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="magnetic group fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-7 sm:right-7"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink opacity-0 shadow-xl transition group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Fale conosco
      </span>
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_40px_-6px_rgba(37,211,102,.7)] transition group-hover:scale-110">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-30" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  );
}
