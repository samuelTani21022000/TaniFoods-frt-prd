create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  available boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  delivery_type text not null check (delivery_type in ('retirada', 'entrega')),
  address text,
  payment_method text not null,
  notes text,
  subtotal numeric(10,2),
  total numeric(10,2) not null,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table public.categories add column if not exists active boolean default true;
alter table public.categories add column if not exists sort_order integer default 0;
alter table public.categories add column if not exists created_at timestamptz default now();

alter table public.products add column if not exists available boolean default true;
alter table public.products add column if not exists sort_order integer default 0;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists created_at timestamptz default now();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon
using (active = true);

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products"
on public.products
for select
to anon
using (available = true);

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
to anon
with check (
  customer_name <> ''
  and customer_phone <> ''
  and delivery_type::text in ('retirada', 'entrega')
  and payment_method::text in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito')
  and total >= 0
);

drop policy if exists "Public can create order items" on public.order_items;
create policy "Public can create order items"
on public.order_items
for insert
to anon
with check (
  order_id is not null
  and product_name <> ''
  and quantity > 0
  and unit_price >= 0
  and subtotal >= 0
);

create index if not exists categories_active_sort_idx on public.categories(active, sort_order);
create index if not exists products_available_sort_idx on public.products(available, sort_order);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- Seed completo do cardapio Tani Foods
-- Origem: tani_foods_cardapio.json
-- Remove o cardapio atual e insere todas as categorias e produtos do JSON.
-- Pedidos antigos sao preservados; os itens antigos ficam sem vinculo com produtos removidos.

begin;

update public.order_items
set product_id = null
where product_id is not null;

delete from public.products;
delete from public.categories;

insert into public.categories (name, slug, sort_order, active)
values
  ('Pastéis Simples', 'pasteis-simples', 1, true),
  ('Pastéis Especiais', 'pasteis-especiais', 2, true),
  ('Pastéis Doces', 'pasteis-doces', 3, true),
  ('Pastéis da Casa', 'pasteis-da-casa', 4, true),
  ('Hambúrgueres Padrão', 'hamburgueres-padrao', 5, true),
  ('Lanches com Frango', 'lanches-frango', 6, true),
  ('Lanches Gigantes', 'lanches-gigantes', 7, true),
  ('Artesanais', 'artesanais', 8, true),
  ('Lanches Inovadores', 'lanches-inovadores', 9, true),
  ('Hot Dogs', 'hot-dogs', 10, true),
  ('Porções', 'porcoes', 11, true),
  ('Acompanhamentos', 'acompanhamentos', 12, true),
  ('Refrigerantes', 'refrigerantes', 13, true),
  ('Cervejas', 'cervejas', 14, true),
  ('Água', 'agua', 15, true);

insert into public.products (category_id, name, description, price, image_url, sort_order, available)
select c.id, p.name, p.description, p.price, p.image_url, p.sort_order, p.available
from (
  values
  ('pasteis-simples', 'Carne', 'Carne moída e queijo', 13.00, null, 1, true),
  ('pasteis-simples', 'Queijo', 'Mussarela', 12.00, null, 2, true),
  ('pasteis-simples', 'Pizza', 'Mussarela, presunto, tomate e orégano', 13.00, null, 3, true),
  ('pasteis-simples', 'Frango', 'Frango desfiado e queijo', 13.00, null, 4, true),
  ('pasteis-especiais', 'Pastel Carne Especial 1', 'Carne com queijo (cheddar/catupiry)', 18.00, null, 5, true),
  ('pasteis-especiais', 'Pastel Carne Especial 2', 'Carne, queijo e ovo', 18.00, null, 6, true),
  ('pasteis-especiais', 'Pastel Frango Especial', 'Frango, milho e catupiry', 18.00, null, 7, true),
  ('pasteis-especiais', 'Pastel Pizza à Portuguesa', 'Presunto, mussarela, milho, ervilha e palmito', 18.00, null, 8, true),
  ('pasteis-especiais', 'Pastel 3 Queijos', 'Mussarela, catupiry, cheddar', 18.00, null, 9, true),
  ('pasteis-especiais', 'Pastel 4 Tomates Queijos', 'Queijo, requeijão, gorgonzola, cheddar', 18.00, null, 10, true),
  ('pasteis-especiais', 'Pastel Queijo Cheddar Bacon', 'Queijo, cheddar e bacon', 18.00, null, 11, true),
  ('pasteis-doces', 'Nutella', 'Nutella ou chocolate', 16.00, null, 12, true),
  ('pasteis-doces', 'Misto Doce', 'Chocolate branco e preto', 16.00, null, 13, true),
  ('pasteis-doces', 'Doce de Leite', 'Doce de leite (opcional queijo)', 16.00, null, 14, true),
  ('pasteis-da-casa', 'Pastel de Costela', 'Costela com catupiry e muito queijo', 22.00, null, 15, true),
  ('pasteis-da-casa', 'Pastel Gigante', 'Carne, presunto, queijo, requeijão, bacon, cabreza, tomate, milho, frango e fatias de cheddar', 35.00, null, 16, true),
  ('pasteis-da-casa', 'Pastel de Camarão', 'Camarão (inteiro) ao alho, cream cheese ou requeijão', 29.00, null, 17, true),
  ('pasteis-da-casa', 'Pastel Calabacon', 'Muito queijo, calabresa e bacon', 18.00, null, 18, true),
  ('pasteis-da-casa', 'Pastel de Tilápia', 'Tilápia com queijo e pimenta biquinho', 23.00, null, 19, true),
  ('hamburgueres-padrao', 'X-Burguer', 'Hambúrguer, presunto, muçarela e maionese', 15.00, null, 20, true),
  ('hamburgueres-padrao', 'X-Salada', 'Alface, tomate, hambúrguer, presunto, muçarela, maionese', 18.90, null, 21, true),
  ('hamburgueres-padrao', 'X-Bacon', 'Hambúrguer, muito bacon, muçarela, salada, maionese', 21.50, null, 22, true),
  ('hamburgueres-padrao', 'X-Tudo', '2 hambúrgueres, presunto, muçarela, salada, calabresa, bacon, ovo, catupiry', 33.90, null, 23, true),
  ('hamburgueres-padrao', 'X-Egg', 'Hambúrguer, queijo, ovo, alface, maionese, tomate', 15.00, null, 24, true),
  ('hamburgueres-padrao', 'X-Hot', 'Hambúrguer, salsicha, queijo, milho, batata palha, ovo, alface e tomate', 18.30, null, 25, true),
  ('hamburgueres-padrao', 'X-Calabresa', 'Hambúrguer, queijo, calabresa, alface, maionese e tomate', 18.90, null, 26, true),
  ('lanches-frango', 'Frango Bacon', 'Frango, bacon, muçarela e salada', 20.90, null, 27, true),
  ('lanches-frango', 'Frango Salada', 'Frango, salada, muçarela e milho', 19.90, null, 28, true),
  ('lanches-frango', 'Frango Tudo', 'Frango, muçarela, milho, bacon, calabresa, ovo, cheddar, salada e cebola', 32.00, null, 29, true),
  ('lanches-frango', 'Frango Máximus', 'Dobro de frango, presunto, muçarela, salada, milho, bacon, catupiry', 33.90, null, 30, true),
  ('lanches-gigantes', 'Mega 1k', 'Pão gigante, 2 hambúrgueres, 2 ovos, 2x presunto, 2x mussarela, calabresa, bacon, frango empanado, salada, catchup, mostarda, maionese, batata palha, cheddar e molho especial', 39.00, null, 31, true),
  ('lanches-gigantes', 'X-Piraju 2k', 'Pão gigante, 4 hambúrgueres, presunto, muçarela, salada, 4 ovos, bacon, calabresa, milho, salsicha, tomate, frango grelhado, catchup, mostarda, molho especial, batata palha, cheddar e catupiry', 67.00, null, 32, true),
  ('artesanais', 'Art. Salada', 'Pão brioche, hambúrguer 150g, muito queijo, salada, maionese da casa', 26.90, null, 33, true),
  ('artesanais', 'Art. Bacon', 'Pão brioche, hambúrguer 150g, muito bacon, queijo, salada, maionese', 30.90, null, 34, true),
  ('artesanais', 'Art. Cheddar', 'Pão brioche, hambúrguer 150g, bacon, queijo, fatias de cheddar, salada', 36.90, null, 35, true),
  ('artesanais', 'Art. Queijo', 'Pão brioche, hambúrguer 150g, rodela de queijo empanada, salada', 39.90, null, 36, true),
  ('lanches-inovadores', 'Kids', 'Hambúrguer, molho especial, cheddar, fatias de queijo + batata frita + refri lata', 33.50, null, 37, true),
  ('lanches-inovadores', 'X-Havaí', 'Hambúrguer, abacaxi caramelizado, queijo provolone, bacon, calabresa e salada', 36.00, null, 38, true),
  ('lanches-inovadores', 'X-Onion', 'Hambúrguer, anéis de cebola, bacon, queijo e cheddar, barbecue, salada', 32.90, null, 39, true),
  ('hot-dogs', 'Dog Simples', 'Pão, salsicha, vinagrete, ketchup, mostarda, maionese da casa e batata palha', 15.00, null, 40, true),
  ('hot-dogs', 'Dog Frango', 'Pão, salsicha, frango desfiado, vinagrete, ketchup, mostarda, maionese e batata palha', 16.00, null, 41, true),
  ('hot-dogs', 'Dog Misto', 'Pão, salsicha, presunto, mussarela, vinagrete, ketchup, mostarda, maionese e batata palha', 16.00, null, 42, true),
  ('hot-dogs', 'Dog Bacon', 'Pão, salsicha, bacon, vinagrete, ketchup, mostarda, maionese e batata palha', 16.00, null, 43, true),
  ('hot-dogs', 'Dog Calabresa com Bacon', 'Pão, salsicha, calabresa, bacon, vinagrete, ketchup, mostarda, maionese e batata palha', 17.00, null, 44, true),
  ('hot-dogs', 'Dog à Bolonhesa', 'Pão, salsicha, carne moída, queijo, vinagrete, ketchup, mostarda, maionese e batata palha', 20.00, null, 45, true),
  ('hot-dogs', 'Dog Tudão', 'Pão, duas salsichas, presunto, mussarela, calabresa, bacon, frango desfiado, milho, batata palha, ketchup, mostarda, cheddar e maionese', 27.00, null, 46, true),
  ('hot-dogs', 'Dog Alcatra', 'Alcatra picada em tiras, bacon, 2 salsichas, vinagrete, milho, queijo e batata palha', 35.00, null, 47, true),
  ('porcoes', 'Porção de Tilápia (800g)', 'Acompanha molho defumado da casa, maionese de alho e limão', 55.00, null, 48, true),
  ('porcoes', 'Batata Frita com Cheddar e Bacon (1kg)', 'Acompanha molho defumado da casa, maionese de alho e limão', 40.00, null, 49, true),
  ('porcoes', 'Mandioca com Cheddar e Bacon (1kg)', 'Acompanha molho defumado da casa, maionese de alho e limão', 40.00, null, 50, true),
  ('porcoes', 'Meia Porção com Cheddar e Bacon', 'Acompanha molho defumado da casa, maionese de alho e limão', 40.00, null, 51, true),
  ('porcoes', 'Tulipa Empanada com Gergelim', 'Acompanha molho defumado da casa, maionese de alho e limão', 40.00, null, 52, true),
  ('porcoes', 'Calabresa Acebolada', 'Acompanha molho defumado da casa, maionese de alho e limão', 40.00, null, 53, true),
  ('porcoes', 'Porção Fria', 'Presunto, mussarela em cubos, orégano e limão', 35.00, null, 54, true),
  ('acompanhamentos', 'Batata Frita Pequena', '', 8.90, null, 55, true),
  ('acompanhamentos', 'Batata Frita Grande', '', 12.90, null, 56, true),
  ('refrigerantes', 'Fanta Lata', '', 6.00, null, 57, true),
  ('refrigerantes', 'Coca-Cola Lata', '', 6.00, null, 58, true),
  ('refrigerantes', 'Guaraná Antártica Lata', '', 6.00, null, 59, true),
  ('refrigerantes', 'Conquista', '', 8.70, null, 60, true),
  ('refrigerantes', 'Coca-Cola 1L', '', 11.00, null, 61, true),
  ('refrigerantes', 'Coca-Cola 2L', '', 16.00, null, 62, true),
  ('refrigerantes', 'Guaraná Conquista 2L', '', 8.00, null, 63, true),
  ('cervejas', 'Brahma Lata', '', 5.50, null, 64, true),
  ('cervejas', 'Skol Lata', '', 5.50, null, 65, true),
  ('cervejas', 'Antártica Boa Lata', '', 5.50, null, 66, true),
  ('cervejas', 'Antártica Boa Litrão', '', 15.00, null, 67, true),
  ('cervejas', 'Heineken Long Neck 330ml', '', 10.00, null, 68, true),
  ('agua', 'Água sem Gás', '', 3.00, null, 69, true),
  ('agua', 'Água com Gás', '', 3.50, null, 70, true)
) as p(category_slug, name, description, price, image_url, sort_order, available)
join public.categories c on c.slug = p.category_slug;

commit;
