import type { Metadata } from "next";
import { CtaBanner } from "@/components/home/Sections";
import { ExperienceHub } from "@/components/player/ExperienceHub";
import { PageHero } from "@/components/ui/Primitives";
import { getSettings, getShowcase } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experimente Nosso Trabalho",
  description: "Ouça músicas e produções do estúdio, assista a videoclipes, comerciais e conheça produções feitas com inteligência artificial.",
  alternates: { canonical: "/experimente" },
};

export default async function ExperiencePage() {
  const [settings, media] = await Promise.all([getSettings(), getShowcase()]);
  return (
    <>
      <PageHero
        eyebrow="Player exclusivo"
        title={<>Experimente <span className="text-gradient">nosso trabalho</span></>}
        text="Músicas, produções do estúdio, videoclipes, comerciais e projetos com inteligência artificial."
      />
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <ExperienceHub media={media} />
      </section>
      <CtaBanner settings={settings} />
    </>
  );
}
