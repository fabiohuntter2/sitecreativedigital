import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Effects } from "@/components/ui/Effects";
import { getServices, getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/constants";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const sameAs = Object.values(settings.social).filter(Boolean);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.site.name,
    slogan: settings.site.slogan,
    description: settings.seo.description,
    url: SITE_URL,
    telephone: `+${settings.contact.whatsapp}`,
    email: settings.contact.email,
    ...(settings.contact.city ? { address: { "@type": "PostalAddress", addressLocality: settings.contact.city, addressCountry: "BR" } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.short_description, url: `${SITE_URL}/servicos/${s.slug}` },
      })),
    },
  };

  return (
    <>
      <Header logoUrl={settings.site.logoUrl} />
      <main id="conteudo">{children}</main>
      <Footer settings={settings} services={services} />
      <WhatsAppFloat number={settings.contact.whatsapp} message={settings.contact.whatsappMessage} />
      <Effects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
