create extension if not exists pgcrypto;

do $$ begin
  create type payment_method as enum ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  badge text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  delivery_type text not null check (delivery_type in ('retirada', 'entrega')),
  address text,
  payment_method payment_method not null,
  notes text,
  subtotal numeric(10,2) check (subtotal >= 0),
  delivery_fee numeric(10,2) default 0 check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text default 'novo',
  whatsapp_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text default 'TaniFoods',
  whatsapp_number text,
  delivery_fee numeric(10,2) default 0 check (delivery_fee >= 0),
  accepting_orders boolean default true,
  opening_hours text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.business_settings enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories
for select
to anon
using (is_active = true);

drop policy if exists "Public can read available products" on public.products;
create policy "Public can read available products"
on public.products
for select
to anon
using (is_active = true);

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

create index if not exists categories_is_active_sort_idx on public.categories(is_active, sort_order);
create index if not exists products_is_active_sort_idx on public.products(is_active, sort_order);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);