import type { Metadata } from "next";
import { AboutSection, CtaBanner, ProcessSection } from "@/components/home/Sections";
import { ServiceIcon } from "@/components/ui/Icon";
import { PageHero } from "@/components/ui/Primitives";
import { getServices, getSettings } from "@/lib/content";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a Huntter Produções: agência digital, estúdio musical e produtora audiovisual.",
  alternates: { canonical: "/sobre" },
};

export default async function AboutPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  return (
    <>
      <PageHero
        eyebrow="Sobre nós"
        title={<>Criatividade, técnica e <span className="text-gradient">tecnologia</span></>}
        text={settings.site.slogan}
      />
      <AboutSection settings={settings} />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8" aria-labelledby="areas-h">
        <h2 id="areas-h" className="reveal mb-8 text-center font-display text-3xl font-bold">Nossas áreas de atuação</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.id} className="reveal" style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
              <Link href={`/servicos/${s.slug}`} className="glass flex h-full items-start gap-4 rounded-2xl p-5 transition hover:border-purple/50">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple/40 to-green/20">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display font-semibold">{s.title}</span>
                  <span className="mt-1 block text-sm text-mute">{s.short_description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ProcessSection />
      <CtaBanner settings={settings} />
    </>
  );
}
