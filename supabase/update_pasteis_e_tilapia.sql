-- Ajustes pontuais do cardapio:
-- 1. Padroniza pasteis como "Pastel de [sabor]".
-- 2. Atualiza o preco da Porcao de Tilapia para R$ 60,00.

begin;

update public.products
set name = 'Pastel de Carne'
where name in ('Carne', 'Pastel Carne')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Queijo'
where name in ('Queijo', 'Pastel Queijo')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Pizza'
where name in ('Pizza', 'Pastel Pizza')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Frango'
where name in ('Frango', 'Pastel Frango')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Nutella'
where name in ('Nutella', 'Pastel Nutella')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Misto Doce'
where name in ('Misto Doce', 'Pastel Misto Doce')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set name = 'Pastel de Doce de Leite'
where name in ('Doce de Leite', 'Pastel Doce de Leite')
  and category_id in (
    select id from public.categories where slug in ('pasteis', 'pasteis-doces')
  );

update public.products
set price = 60.00
where name = 'Porção de Tilápia (800g)'
  and category_id in (
    select id from public.categories where slug = 'porcoes'
  );

commit;
