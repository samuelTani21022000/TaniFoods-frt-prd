-- Adiciona o valor 'cartao_debito' ao enum payment_method
-- A aplicacao envia este valor ao finalizar pedidos com cartao de debito,
-- mas o enum existente no banco nao o inclui, causando o erro:
--   invalid input value for enum payment_method: "cartao_debito"

alter type payment_method add value if not exists 'cartao_debito';
