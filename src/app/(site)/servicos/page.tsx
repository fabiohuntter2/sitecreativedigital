import type { Metadata } from "next";
import { CtaBanner } from "@/components/home/Sections";
import { ServiceCard } from "@/components/services/ServiceCard";
import { PageHero } from "@/components/ui/Primitives";
import { getServices, getSettings } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Criação de sites, estúdio de áudio, produção musical com inteligência artificial, marketing digital, registro de músicas e produção audiovisual.",
  alternates: { canonical: "/servicos" },
};

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <PageHero
        eyebrow="Serviços"
        title={<>Soluções criativas <span className="text-gradient">de ponta a ponta</span></>}
        text="Escolha uma área para conhecer os detalhes e solicitar um orçamento personalizado."
      />
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} whatsapp={settings.contact.whatsapp} index={i} />
          ))}
        </div>
      </section>
      <CtaBanner settings={settings} />
    </>
  );
}
