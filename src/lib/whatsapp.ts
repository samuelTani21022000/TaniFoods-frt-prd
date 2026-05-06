import type { CartItem, CheckoutData } from "@/types";
import { formatCurrency, normalizePhone, orderShortId } from "@/lib/format";
import { getItemSubtotal, getItemUnitPrice } from "@/lib/cart";

const paymentLabels = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartao de credito",
  cartao_debito: "Cartao de debito"
};

const SEPARATOR = "---------------";

const DELIVERY_FEE = 3;

export function buildWhatsAppMessage(orderId: string, checkout: CheckoutData, items: CartItem[], total: number): string {
  const deliveryLabel = checkout.deliveryType === "delivery" ? "Entrega" : "Retirada";
  const isDelivery = checkout.deliveryType === "delivery";
  const subtotal = total - (isDelivery ? DELIVERY_FEE : 0);

  const header = [
    "🛒 *Novo pedido - TaniFoods*",
    "",
    `📋 *Pedido:* #${orderShortId(orderId)}`,
    `👤 *Cliente:* ${checkout.customerName}`,
    `📱 *Telefone:* ${checkout.customerPhone}`,
    `🚚 *Entrega:* ${deliveryLabel}`,
    checkout.address ? `📍 *Endereco:* ${checkout.address}` : null,
  ].filter(Boolean);

  const itemBlocks = items.map((item) => {
    const subtotal = getItemSubtotal(item);
    const unitPrice = getItemUnitPrice(item);
    const baseSubtotal = Number(item.product.price) * item.quantity;

    const lines = [`🍔 *${item.quantity}x ${item.product.name}*`];

    if (item.quantity > 1) {
      lines.push(`  Produto: ${formatCurrency(Number(item.product.price))} x ${item.quantity} = ${formatCurrency(baseSubtotal)}`);
    } else {
      lines.push(`  Produto: ${formatCurrency(Number(item.product.price))}`);
    }

    if (item.options.length > 0) {
      lines.push("  Itens adicionais:");
      item.options.forEach((option) => {
        const optionSubtotal = Number(option.price) * item.quantity;
        const optionValue =
          item.quantity > 1
            ? `${formatCurrency(Number(option.price))} x ${item.quantity} = ${formatCurrency(optionSubtotal)}`
            : formatCurrency(Number(option.price));
        lines.push(`    ➕ ${option.name}: ${optionValue}`);
      });
    } else {
      lines.push("  Sem adicionais");
    }

    if (item.quantity > 1) {
      lines.push(`  💰 Total: ${formatCurrency(unitPrice)} cada - ${formatCurrency(subtotal)}`);
    } else {
      lines.push(`  💰 Total: ${formatCurrency(subtotal)}`);
    }

    return lines.join("\n");
  });

  const footer = [
    `💳 *Pagamento:* ${paymentLabels[checkout.paymentMethod]}`,
    checkout.notes ? `📝 *Observacoes:* ${checkout.notes}` : "📝 *Observacoes:* Nenhuma",
    "",
    `📦 Subtotal: ${formatCurrency(subtotal)}`,
    isDelivery ? `🛵 Taxa de entrega: ${formatCurrency(DELIVERY_FEE)}` : null,
    `💵 *TOTAL: ${formatCurrency(total)}*`,
  ].filter(Boolean);

  return [
    ...header,
    "",
    SEPARATOR,
    ...itemBlocks.join(`\n${SEPARATOR}\n`).split("\n"),
    SEPARATOR,
    "",
    ...footer,
  ].join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "");

  if (!number && process.env.NODE_ENV !== "production") {
    throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER nao foi configurado.");
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}