export type ServiceItem = {
  name: string;
  description?: string;
  /** Texto livre de preço, ex.: "A partir de R$ 800". Vazio = "Sob consulta". */
  price?: string;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  icon: string;
  image_url: string;
  items: ServiceItem[];
  price_label: string;
  whatsapp_message: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at?: string;
};

export type PortfolioCategory =
  | "sites"
  | "musicas"
  | "videoclipes"
  | "comerciais"
  | "artes"
  | "ia"
  | "audiovisual";

export type MediaType = "image" | "video" | "audio" | "youtube" | "link";

export type PortfolioItem = {
  id: string;
  slug: string;
  title: string;
  category: PortfolioCategory;
  description: string;
  cover_url: string;
  media_type: MediaType;
  media_url: string;
  external_url: string;
  gallery: string[];
  is_example: boolean;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

export type ShowcaseKind = "audio" | "video";
export type ShowcaseCategory = "musica" | "estudio" | "videoclipe" | "comercial" | "audiovisual" | "ia";

export type ShowcaseMedia = {
  id: string;
  title: string;
  subtitle: string;
  kind: ShowcaseKind;
  category: ShowcaseCategory;
  /** arquivo (mp3/mp4) ou link do YouTube */
  url: string;
  cover_url: string;
  is_example: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  avatar_url: string;
  rating: number;
  is_example: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
};

export type QuoteStatus = "novo" | "em_andamento" | "respondido" | "arquivado";

export type Attachment = { name: string; url: string; size: number; type: string };

export type Quote = {
  id: string;
  protocol: string;
  service: string;
  subservice: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  deadline: string;
  budget: string;
  references: string;
  attachments: Attachment[];
  status: QuoteStatus;
  notes: string;
  created_at?: string;
};

export type Settings = {
  site: {
    name: string;
    slogan: string;
    logoUrl: string;
    heroEyebrow: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    heroImage: string;
    aboutTitle: string;
    aboutText: string;
    aboutImage: string;
    ctaTitle: string;
    ctaText: string;
    footerText: string;
  };
  contact: {
    whatsapp: string;
    whatsappDisplay: string;
    whatsappMessage: string;
    email: string;
    city: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
};

export type TableName = "services" | "portfolio" | "media" | "testimonials" | "quotes";

export type TableMap = {
  services: Service;
  portfolio: PortfolioItem;
  media: ShowcaseMedia;
  testimonials: Testimonial;
  quotes: Quote;
};
