# Deploy AWS S3 + CloudFront

## 1. Configure as variaveis

Crie `.env.local` antes do build:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dlsgukucjhphudejixld.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER=5514998512200
```

Nao coloque senha do banco, connection string Postgres, `service_role` ou secret key no frontend.

## 2. Gere o build estatico

```bash
npm install
npm run build
```

O Next.js exporta os arquivos estaticos para `out`.

## 3. Envie para o S3

```bash
aws s3 sync ./out s3://NOME_DO_BUCKET --delete
```

Configure o bucket para hospedagem estatica somente se nao estiver usando Origin Access Control no CloudFront.

## 4. Configure o CloudFront

- Origem: bucket S3 do site.
- Viewer protocol policy: Redirect HTTP to HTTPS.
- Default root object: `index.html`.
- Error responses:
  - 403 para `/index.html`, status 200, se precisar de fallback.
  - 404 para `/index.html`, status 200, se precisar de fallback.
- Configure certificado ACM se usar dominio proprio.

## 5. Invalide o cache

```bash
aws cloudfront create-invalidation --distribution-id ID_DA_DISTRIBUICAO --paths "/*"
```
