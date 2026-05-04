# TaniFoods

Cardapio online mobile-first para hamburgueria/lanchonete, criado com Next.js, React, TypeScript, Tailwind CSS e Supabase.

## Stack

- Next.js com exportacao estatica
- React + TypeScript
- Tailwind CSS
- Lucide React
- Supabase via `@supabase/supabase-js`
- Deploy alvo: AWS S3 + CloudFront

## Configuracao

Crie um `.env.local` localmente com base em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dlsgukucjhphudejixld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER=5514998512200
```

Use somente a chave anon/publica do Supabase no frontend. Nao use senha do banco, connection string Postgres, `service_role` ou secret key no app.

## Supabase

Execute o SQL de `supabase/schema.sql` no SQL Editor do Supabase. Ele cria:

- `categories`
- `products`
- `orders`
- `order_items`
- politicas RLS para leitura publica apenas de categorias/produtos ativos
- insert publico de pedidos e itens
- nenhuma leitura publica de pedidos ou dados de clientes

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Build

```bash
npm run build
```

Como `next.config.ts` usa `output: "export"`, o build gera a pasta `out`, adequada para S3 + CloudFront.

## Fluxo

O cliente escolhe produtos, preenche o checkout, o app salva o pedido no Supabase, salva os itens em `order_items`, monta a mensagem e abre `wa.me` com o pedido formatado.
