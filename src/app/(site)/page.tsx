import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { AboutSection, CtaBanner, ExperienceTeaser, Marquee, ProcessSection, TestimonialsSection } from "@/components/home/Sections";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ButtonLink, SectionHeading } from "@/components/ui/Primitives";
import { getPortfolio, getServices, getSettings, getShowcase, getTestimonials } from "@/lib/content";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, services, portfolio, media, testimonials] = await Promise.all([
    getSettings(),
    getServices(),
    getPortfolio(),
    getShowcase(),
    getTestimonials(),
  ]);
  const featuredPortfolio = (portfolio.filter((p) => p.featured).length ? portfolio.filter((p) => p.featured) : portfolio).slice(0, 6);
  const recent = [...portfolio]
    .sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")))
    .filter((p) => !featuredPortfolio.includes(p))
    .slice(0, 3);

  return (
    <>
      <Hero settings={settings} />
      <Marquee />
      <AboutSection settings={settings} />

      <section id="servicos" className="relative py-24 sm:py-28" aria-labelledby="servicos-titulo">
        <div aria-hidden="true" className="absolute left-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-purple/15 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Serviços"
            title={<span id="servicos-titulo">Tudo o que sua marca precisa, <span className="text-gradient">em um só estúdio</span></span>}
            text="Tecnologia, música, audiovisual e marketing trabalhando juntos para o seu projeto."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} whatsapp={settings.contact.whatsapp} index={i} />
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />

      {featuredPortfolio.length > 0 && (
        <section className="relative py-24 sm:py-28" aria-labelledby="portfolio-titulo">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Portfólio"
              title={<span id="portfolio-titulo">Trabalhos em <span className="text-gradient">destaque</span></span>}
              text="Sites, músicas, videoclipes, comerciais, artes e projetos com inteligência artificial."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPortfolio.map((p, i) => (
                <PortfolioCard key={p.id} item={p} index={i} />
              ))}
            </div>
            <div className="reveal mt-12 text-center">
              <ButtonLink href="/portfolio" variant="ghost">
                Ver portfólio completo <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      <ExperienceTeaser media={media} />

      {recent.length > 0 && (
        <section className="relative py-20" aria-labelledby="recentes-titulo">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading align="left" eyebrow="Novidades" title={<span id="recentes-titulo">Projetos recentes</span>} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((p, i) => (
                <PortfolioCard key={p.id} item={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TestimonialsSection items={testimonials} />
      <CtaBanner settings={settings} />
    </>
  );
}
