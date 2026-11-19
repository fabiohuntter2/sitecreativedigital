-- =====================================================================
-- Huntter Produções — estrutura do banco (Supabase / PostgreSQL)
-- Execute no Supabase: Dashboard › SQL Editor › New query › Run
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  description text not null default '',
  icon text not null default 'sparkles',
  image_url text not null default '',
  items jsonb not null default '[]'::jsonb,
  price_label text not null default '',
  whatsapp_message text not null default '',
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('sites','musicas','videoclipes','comerciais','artes','ia','audiovisual')),
  description text not null default '',
  cover_url text not null default '',
  media_type text not null default 'image' check (media_type in ('image','video','audio','youtube','link')),
  media_url text not null default '',
  external_url text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  is_example boolean not null default false,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  kind text not null check (kind in ('audio','video')),
  category text not null check (category in ('musica','estudio','videoclipe','comercial','ia')),
  url text not null,
  cover_url text not null default '',
  is_example boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  text text not null,
  avatar_url text not null default '',
  rating int not null default 5 check (rating between 1 and 5),
  is_example boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  service text not null,
  subservice text not null default '',
  name text not null,
  phone text not null,
  whatsapp text not null default '',
  email text not null default '',
  description text not null,
  deadline text not null default '',
  budget text not null default '',
  "references" text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'novo' check (status in ('novo','em_andamento','respondido','arquivado')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_idx on public.quotes (created_at desc);

-- Segurança: RLS ligado e SEM políticas públicas.
-- Todo acesso acontece no servidor do site com a chave service_role (que ignora o RLS).
-- Assim, ninguém consegue ler orçamentos ou alterar conteúdo usando a chave pública (anon).
alter table public.settings     enable row level security;
alter table public.services     enable row level security;
alter table public.portfolio    enable row level security;
alter table public.media        enable row level security;
alter table public.testimonials enable row level security;
alter table public.quotes       enable row level security;

-- Armazenamento de arquivos: o bucket público "media" é criado
-- automaticamente pelo comando `npm run seed:supabase` (ou em Storage › New bucket).
