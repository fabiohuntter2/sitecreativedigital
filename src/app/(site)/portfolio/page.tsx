import type { Metadata } from "next";
import { CtaBanner } from "@/components/home/Sections";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PageHero } from "@/components/ui/Primitives";
import { getPortfolio, getSettings } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Sites, músicas, videoclipes, comerciais, artes, projetos com inteligência artificial e produções audiovisuais.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [settings, items] = await Promise.all([getSettings(), getPortfolio()]);
  return (
    <>
      <PageHero
        eyebrow="Portfólio"
        title={<>Projetos que <span className="text-gradient">ganharam vida</span></>}
        text="Filtre por categoria e clique em um projeto para ver imagens, vídeos, áudios e detalhes."
      />
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <PortfolioGrid items={items} />
      </section>
      <CtaBanner settings={settings} />
    </>
  );
}
