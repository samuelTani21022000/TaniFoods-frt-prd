import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { CartItem, DeliveryType } from "@/types";
import { formatCurrency } from "@/lib/format";
import { getCartCount, getCartTotal, getItemSubtotal, getItemUnitPrice } from "@/lib/cart";
import { getProductImage } from "@/lib/productImages";

type CartProps = {
  items: CartItem[];
  deliveryType: DeliveryType;
  onQuantityChange: (itemId: string, quantity: number) => void;
};

const DELIVERY_FEE = 3;

export function Cart({ items, deliveryType, onQuantityChange }: CartProps) {
  const subtotal = getCartTotal(items);
  const deliveryFee = deliveryType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const itemCount = getCartCount(items);

  return (
    <section className="flex max-h-96 flex-col rounded-xl border border-zinc-200/80 bg-white p-4 shadow-card xl:max-h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-zinc-950">Carrinho</h2>
        <span className="text-sm font-semibold text-zinc-500">{itemCount} itens</span>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl bg-amber-50/50 px-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <ShoppingBag size={24} className="text-amber-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-bold text-zinc-700">Seu carrinho esta vazio</p>
          <p className="mt-1 text-xs text-zinc-500">Adicione produtos do cardapio para iniciar seu pedido.</p>
        </div>
      ) : (
        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const subtotal = getItemSubtotal(item);

            return (
              <div key={item.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between gap-3">
                  <div className="flex min-w-0 gap-2">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-amber-50 ring-1 ring-amber-100/60">
                      <Image src={getProductImage(item.product)} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold leading-tight text-zinc-950">{item.product.name}</p>
                      {item.options.length > 0 ? (
                        <div className="mt-1 space-y-0.5 text-xs leading-snug text-zinc-500">
                          <p className="font-bold text-zinc-600">Adicionais:</p>
                          {item.options.map((option) => (
                            <p key={option.id}>
                              {option.name}: {formatCurrency(option.price)}
                              {item.quantity > 1 ? ` x ${item.quantity} = ${formatCurrency(option.price * item.quantity)}` : ""}
                            </p>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-zinc-500">{formatCurrency(getItemUnitPrice(item))} cada</p>
                    </div>
                  </div>
                  <strong className="whitespace-nowrap font-black text-ember-600">{formatCurrency(subtotal)}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-full border border-zinc-200 bg-white shadow-sm">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center text-zinc-700 transition hover:bg-zinc-50 active:scale-90"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      aria-label={`Diminuir ${item.product.name}`}
                    >
                      <Minus size={16} aria-hidden="true" />
                    </button>
                    <span className="flex h-9 min-w-9 items-center justify-center bg-zinc-50 px-2 text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center text-zinc-700 transition hover:bg-zinc-50 active:scale-90"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`Aumentar ${item.product.name}`}
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-ketchup active:scale-90"
                    onClick={() => onQuantityChange(item.id, 0)}
                    aria-label={`Remover ${item.product.name}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-zinc-950">
        <div className="flex items-center justify-between">
          <span className="font-bold">Subtotal</span>
          <strong className="font-black text-zinc-700">{formatCurrency(subtotal)}</strong>
        </div>
        {deliveryType === "delivery" && (
          <div className="flex items-center justify-between">
            <span className="font-bold">Taxa de entrega</span>
            <strong className="font-black text-zinc-700">{formatCurrency(deliveryFee)}</strong>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
          <span className="font-bold">Total</span>
          <strong className="text-xl font-black text-ember-600">{formatCurrency(total)}</strong>
        </div>
      </div>
    </section>
  );
}