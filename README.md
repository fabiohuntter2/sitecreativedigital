# Huntter Produções — Site oficial

Agência digital, estúdio musical e produtora audiovisual.
Site comercial com painel administrativo, portfólio, players de áudio e vídeo, orçamentos e integração com o WhatsApp.

---

## 1. Arquitetura

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions) |
| Linguagem | **TypeScript** |
| Estilo | **Tailwind CSS 4** + CSS próprio (identidade visual em `src/app/globals.css`) |
| Banco de dados | **Supabase (PostgreSQL)**, ou **arquivo local** (`data/db.json`) para desenvolvimento ou VPS |
| Arquivos (imagens/áudios/vídeos) | **Supabase Storage**, ou pasta local `data/uploads` |
| Login do painel | E-mail + senha (hash **bcrypt**) + sessão **JWT** em cookie `httpOnly` (biblioteca `jose`) |
| Validação | **Zod** em todos os formulários e ações do painel |
| Ícones | `lucide-react` + ícones de redes sociais em SVG próprio |

O site escolhe o banco sozinho: **se as variáveis do Supabase estiverem preenchidas, usa o Supabase. Se não, usa o arquivo local.**

```
src/
├─ app/
│  ├─ (site)/            → páginas públicas (início, serviços, portfólio, experimente, orçamento, sobre, contato)
│  ├─ admin/             → painel (login + área protegida)
│  ├─ actions/quote.ts   → envio de orçamento (server action)
│  ├─ api/upload/        → upload seguro (URL assinada no Supabase ou token local)
│  ├─ media/[...path]/   → entrega de arquivos no modo local (com suporte a streaming)
│  ├─ sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, icon.svg
├─ components/           → marca, layout, home, serviços, portfólio, players, orçamento, admin
├─ lib/                  → banco (drivers), autenticação, conteúdo, WhatsApp, validações
├─ data/seed.json        → conteúdo inicial (aplicado só na primeira execução)
└─ proxy.ts              → protege as rotas /admin
supabase/schema.sql      → estrutura do banco + bucket de arquivos
scripts/                 → gerar hash da senha, mídias demonstrativas e popular o Supabase
```

## 2. Identidade visual

- **Cores:** preto profundo `#090909`, grafite `#171717`, roxo `#713BCE`, verde `#39D6A0`, branco `#FFFFFF`
- **Tipografia:** *Sora* (títulos) e *Manrope* (textos)
- **Logo:** símbolo "H + play" com órbita roxo→verde, recriado em SVG a partir do logotipo da marca (`src/components/brand/Logo.tsx`). Para usar o arquivo original, envie-o em **Painel › Textos, imagens e contatos › Logotipo**.
- **Efeitos:** gradientes, iluminação difusa, grade tecnológica, granulação cinematográfica, cards com borda luminosa que segue o mouse, revelação ao rolar, equalizadores animados. Todos respeitam `prefers-reduced-motion`.

## 3. Rodando no computador

Requisitos: **Node.js 20+**.

```powershell
npm install
npm run dev
```

Abra http://localhost:3000. O painel fica em http://localhost:3000/admin.

O arquivo `.env.local` já vem com um **login de teste**. O e-mail e a senha estão nos comentários dentro dele.
**Troque essa senha antes de publicar** (passo 4).

## 4. Definindo o login do administrador

```powershell
npm run hash-password -- "SuaSenhaForteAqui"
```

Copie as linhas geradas (`ADMIN_PASSWORD_HASH=b64:...` e `AUTH_SECRET=...`) para o `.env.local` e defina `ADMIN_EMAIL`.
Reinicie o servidor.

> O hash vai em base64 (`b64:`) porque o carregador de `.env` do Next.js interpreta o caractere `$` do bcrypt.

## 5. Configurando o Supabase (banco + arquivos)

O plano gratuito do Supabase atende bem para começar.

1. Crie uma conta e um projeto em https://supabase.com.
2. Abra **SQL Editor › New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas e o bucket público `media`.
3. Em **Project Settings › API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - chave `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**secreta**: nunca publique nem coloque em código do navegador)
4. Coloque as duas no `.env.local` e rode `npm run seed:supabase` para carregar o conteúdo inicial.
5. Reinicie. O painel passa a mostrar **Banco: Supabase**.

**Segurança:** as tabelas usam RLS sem políticas públicas. Só o servidor do site, com a chave `service_role`, lê e grava. Os orçamentos ficam protegidos.
Os uploads vão direto do navegador para o Supabase por URL assinada e temporária, sem limite de tamanho do servidor.

## 6. Publicando na internet (Vercel, recomendado)

> **Configuração atual (no ar em https://sitecreativedigital.vercel.app):** o projeto usa a **integração Supabase da Vercel** (Storage › Supabase).
> O site lê sozinho as variáveis que a integração cria (`NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SECRET_KEY`).
> Ele também deriva o segredo de sessão da chave secreta e lê o login do painel da linha `admin` da tabela `settings`.
> Num banco vazio, o conteúdo inicial e o bucket são criados automaticamente na primeira visita.
> Para trocar a senha do painel: gere o hash com `npm run hash-password` e atualize essa linha no editor SQL do Supabase.
> O passo a passo abaixo vale para quem prefere cadastrar as variáveis manualmente.

1. Envie o projeto para um repositório no GitHub (o `.gitignore` já ignora `.env.local` e `data/`).
2. Em https://vercel.com › **Add New › Project**, importe o repositório.
3. Em **Environment Variables**, cadastre:
   `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Clique em **Deploy**. Depois, em **Settings › Domains**, conecte seu domínio (ex.: `huntterproducoes.com.br`) e atualize `NEXT_PUBLIC_SITE_URL`.
5. Cadastre o site no **Google Search Console** e envie `https://seudominio/sitemap.xml`.

> Na Vercel o **Supabase é obrigatório**: o disco do servidor não é permanente.
> Em uma VPS própria (`npm run build && npm start`), o modo local também funciona, desde que você faça backup das pastas `data/`.

## 7. O que o painel administra

| Seção | Permite |
|---|---|
| Orçamentos | listar, filtrar por status, ver detalhes e anexos, responder pelo WhatsApp ou e-mail, mudar status, anotar, excluir |
| Serviços e preços | criar, editar, excluir, ocultar; itens de cada serviço com **preço** ("Sob consulta" se vazio); mensagem do WhatsApp por serviço |
| Portfólio | projetos com capa, imagem, vídeo (arquivo ou YouTube), áudio, link, galeria; destaque; marcação de "Exemplo" |
| Músicas e vídeos | conteúdo da área **Experimente Nosso Trabalho** |
| Depoimentos | criar, editar, ocultar, excluir |
| Textos, imagens e contatos | textos do banner e do "Quem somos", fotos, logo, WhatsApp, e-mail, redes sociais, SEO |

## 8. Orçamentos e WhatsApp

- O botão flutuante usa a mensagem inicial configurada no painel.
- Cada serviço, e cada item dele, tem um botão com mensagem própria.
- O formulário `/orcamento` valida os dados, aceita até 5 arquivos de 25 MB, **grava o pedido no painel** com protocolo e gera a mensagem organizada para o WhatsApp.
- O site **não envia mensagens automaticamente**: o cliente confirma o envio no próprio WhatsApp. Envio automático exigiria a API oficial do WhatsApp Business (paga, com aprovação da Meta), que não está integrada.
- Proteções: limite de envios por IP, campo anti-robô invisível e autorização de contato obrigatória.

## 9. Conteúdo demonstrativo

As faixas de áudio (`public/demo/audio`) foram **sintetizadas por código** e os vídeos (`public/demo/video`) foram gerados com ffmpeg com o aviso "EXEMPLO DEMONSTRATIVO". Nenhum material tem direitos de terceiros.
Projetos, mídias e depoimentos iniciais aparecem com o selo **EXEMPLO**. Nenhum cliente ou trabalho foi inventado.
O painel avisa quantos exemplos ainda existem. **Substitua-os por conteúdo real antes de divulgar o site.**

Para gerar as mídias de novo (requer ffmpeg): `npm run media:demo`.

## 10. Observações importantes

- **Registro de músicas:** os textos deixam claro que o serviço é de preparação, orientação e apoio. O site não promete registro automático nem proteção jurídica.
- **Preços:** vêm vazios ("Sob consulta"). Defina pelo painel quando quiser.
- **Limitador de tentativas:** fica em memória. Em hospedagem serverless ele vale por instância. Para tráfego alto, use um Redis (ex.: Upstash).
- **Imagens:** fotos enviadas são otimizadas automaticamente (AVIF/WebP) pelo `next/image`.
