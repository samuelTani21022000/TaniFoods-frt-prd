import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { formatCurrency } from "@/lib/format";
import { getCartCount, getCartTotal, getItemSubtotal, getItemUnitPrice } from "@/lib/cart";
import { getProductImage } from "@/lib/productImages";

type CartProps = {
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
};

export function Cart({ items, onQuantityChange }: CartProps) {
  const total = getCartTotal(items);
  const itemCount = getCartCount(items);

  return (
    <section className="flex max-h-96 flex-col rounded-lg border border-zinc-200 bg-white p-4 xl:max-h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-zinc-950">Carrinho</h2>
        <span className="text-sm font-semibold text-zinc-500">{itemCount} itens</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">Adicione produtos para iniciar o pedido.</p>
      ) : (
        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const subtotal = getItemSubtotal(item);

            return (
              <div key={item.id} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between gap-3">
                  <div className="flex min-w-0 gap-2">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
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
                  <strong className="whitespace-nowrap text-zinc-950">{formatCurrency(subtotal)}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-full border border-zinc-200">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center bg-white text-zinc-900"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      aria-label={`Diminuir ${item.product.name}`}
                    >
                      <Minus size={18} aria-hidden="true" />
                    </button>
                    <span className="flex h-10 min-w-10 items-center justify-center bg-zinc-50 px-3 font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center bg-white text-zinc-900"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`Aumentar ${item.product.name}`}
                    >
                      <Plus size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-ketchup"
                    onClick={() => onQuantityChange(item.id, 0)}
                    aria-label={`Remover ${item.product.name}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-zinc-950">
        <span className="font-bold">Total</span>
        <strong className="text-xl">{formatCurrency(total)}</strong>
      </div>
    </section>
  );
}
