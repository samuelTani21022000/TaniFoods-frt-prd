-- Limpa o cardapio atual sem apagar pedidos antigos.
-- Os itens de pedidos antigos permanecem registrados, mas deixam de apontar para produtos removidos.

begin;

update public.order_items
set product_id = null
where product_id is not null;

delete from public.products;
delete from public.categories;

commit;
