# Contexto do Projeto

## Visao geral

TaniFoods e um cardapio online mobile-first para hamburgueria/lanchonete. O cliente escolhe produtos, preenche o checkout, o app salva o pedido no Supabase e abre o WhatsApp com a mensagem formatada do pedido.

## Stack

- Next.js 15 com App Router e exportacao estatica
- React 19
- TypeScript
- Tailwind CSS
- Supabase via `@supabase/supabase-js`
- Lucide React para icones

## Arquivos principais

- `src/app/page.tsx`: tela principal, carregamento do cardapio, carrinho, checkout e envio do pedido.
- `src/components/CheckoutForm.tsx`: formulario de checkout.
- `src/components/Cart.tsx`: carrinho e controle de quantidades.
- `src/components/OrderSuccess.tsx`: aviso de pedido enviado.
- `src/lib/whatsapp.ts`: montagem da mensagem e URL do WhatsApp.
- `src/lib/cart.ts`: persistencia e calculos do carrinho.
- `src/lib/supabase.ts`: criacao do cliente Supabase.
- `src/types/index.ts`: tipos do dominio e schema Supabase.
- `supabase/schema.sql`: estrutura do banco e politicas RLS.

## Fluxo de pedido

1. O usuario adiciona itens ao carrinho.
2. Ao clicar em adicionar um sanduiche ou porcao, o app abre uma caixa de dialogo para selecionar adicionais.
3. Preenche nome, telefone, tipo de entrega, endereco quando necessario, pagamento e observacoes.
4. `handleSubmitOrder` valida os dados, incluindo telefone brasileiro com DDD.
5. O pedido e salvo em `orders`.
6. Os itens sao salvos em `order_items`.
7. A mensagem e montada por `buildWhatsAppMessage`.
8. A URL e montada por `buildWhatsAppUrl`.
9. O app limpa o carrinho, exibe sucesso e abre o WhatsApp em uma nova aba.

## Adicionais

Os adicionais sao exibidos em uma caixa de dialogo para produtos em categorias de sanduiches e porcoes. Eles alteram o preco unitario do item no carrinho, no total, no registro em `order_items` e na mensagem enviada para o WhatsApp. No WhatsApp, cada adicional processado deve aparecer com o valor ao lado.

- Hamburguer artesanal: R$ 7,00
- Hamburguer tradicional: R$ 4,00
- Queijo mussarela: R$ 3,00
- Presunto: R$ 2,00
- Ovo: R$ 2,00
- Salsicha: R$ 2,00
- Cheddar: R$ 3,00
- Catupiry: R$ 3,00
- Queijo empanado: R$ 10,00
- Calabresa: R$ 3,00
- Bacon: R$ 4,00

## Observacao sobre WhatsApp

O redirecionamento para WhatsApp deve abrir somente uma aba com o link final `wa.me`. A aba atual do pedido deve continuar aberta no site, mostrando o estado de sucesso, sem ser redirecionada para fora do app.
