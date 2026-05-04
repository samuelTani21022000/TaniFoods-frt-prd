import type { CartItem, CheckoutData } from "@/types";
import { formatCurrency, normalizePhone, orderShortId } from "@/lib/format";
import { getItemSubtotal, getItemUnitPrice } from "@/lib/cart";

const paymentLabels = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartao de credito",
  cartao_debito: "Cartao de debito"
};

export function buildWhatsAppMessage(orderId: string, checkout: CheckoutData, items: CartItem[], total: number): string {
  const deliveryLabel = checkout.deliveryType === "delivery" ? "Entrega" : "Retirada";
  const lines = [
    "Novo pedido - TaniFoods",
    "",
    `Numero do pedido: #${orderShortId(orderId)}`,
    `Cliente: ${checkout.customerName}`,
    `Telefone: ${checkout.customerPhone}`,
    `Tipo de entrega: ${deliveryLabel}`,
    checkout.address ? `Endereco: ${checkout.address}` : null,
    "",
    "Itens:",
    ...items.map((item) => {
      const subtotal = getItemSubtotal(item);
      const baseSubtotal = Number(item.product.price) * item.quantity;
      const unitPrice = getItemUnitPrice(item);
      const baseLine =
        item.quantity > 1
          ? `  Produto: ${formatCurrency(Number(item.product.price))} x ${item.quantity} = ${formatCurrency(baseSubtotal)}`
          : `  Produto: ${formatCurrency(Number(item.product.price))}`;
      const options =
        item.options.length > 0
          ? `\n  Itens adicionais:\n${item.options
              .map((option) => {
                const optionSubtotal = Number(option.price) * item.quantity;
                const optionValue =
                  item.quantity > 1
                    ? `${formatCurrency(Number(option.price))} x ${item.quantity} = ${formatCurrency(optionSubtotal)}`
                    : formatCurrency(Number(option.price));

                return `  - ${option.name}: ${optionValue}`;
              })
              .join("\n")}`
          : "\n  Sem adicionais";
      const totalLine =
        item.quantity > 1
          ? `Total do item: ${formatCurrency(unitPrice)} cada - ${formatCurrency(subtotal)}`
          : `Total do item: ${formatCurrency(subtotal)}`;

      return `${item.quantity}x ${item.product.name}\n${baseLine}${options}\n  ${totalLine}`;
    }),
    "",
    `Forma de pagamento: ${paymentLabels[checkout.paymentMethod]}`,
    checkout.notes ? `Observacoes: ${checkout.notes}` : "Observacoes: Nenhuma",
    "",
    `Total: ${formatCurrency(total)}`
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "");

  if (!number && process.env.NODE_ENV !== "production") {
    throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER nao foi configurado.");
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
