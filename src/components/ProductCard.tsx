import { useMemo, useState } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import type { Product, ProductOption } from "@/types";
import { formatCurrency } from "@/lib/format";
import { getProductImage } from "@/lib/productImages";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product, options: ProductOption[]) => void;
};

const productOptions: ProductOption[] = [
  { id: "hamburguer-artesanal", name: "Hamburguer artesanal", price: 7 },
  { id: "hamburguer-tradicional", name: "Hamburguer tradicional", price: 4 },
  { id: "queijo-mussarela", name: "Queijo mussarela", price: 3 },
  { id: "presunto", name: "Presunto", price: 2 },
  { id: "ovo", name: "Ovo", price: 2 },
  { id: "salsicha", name: "Salsicha", price: 2 },
  { id: "cheddar", name: "Cheddar", price: 3 },
  { id: "catupiry", name: "Catupiry", price: 3 },
  { id: "queijo-empanado", name: "Queijo empanado", price: 10 },
  { id: "calabresa", name: "Calabresa", price: 3 },
  { id: "bacon", name: "Bacon", price: 4 }
];

function hasOptions(product: Product): boolean {
  const searchable = `${product.name} ${product.categories?.name ?? ""} ${product.categories?.slug ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    searchable.includes("hamb") ||
    searchable.includes("lanche") ||
    searchable.includes("sandu") ||
    searchable.includes("porcao") ||
    searchable.includes("porcoes")
  );
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const allowOptions = hasOptions(product);
  const productImage = getProductImage(product);
  const selectedOptions = useMemo(
    () => productOptions.filter((option) => selectedOptionIds.includes(option.id)),
    [selectedOptionIds]
  );
  const selectedOptionsTotal = selectedOptions.reduce((total, option) => total + option.price, 0);

  function toggleOption(optionId: string) {
    setSelectedOptionIds((current) =>
      current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    );
  }

  function handleAdd() {
    if (allowOptions) {
      setConfirmOpen(true);
      return;
    }

    onAdd(product, []);
  }

  function handleAddWithoutOptions() {
    setSelectedOptionIds([]);
    setConfirmOpen(false);
    onAdd(product, []);
  }

  function handleOpenOptions() {
    setConfirmOpen(false);
    setOptionsOpen(true);
  }

  function handleConfirmOptions() {
    onAdd(product, selectedOptions);
    setSelectedOptionIds([]);
    setOptionsOpen(false);
  }

  return (
    <>
      <article className="group grid grid-cols-[88px_1fr] gap-3 border-b border-zinc-100 bg-white px-4 py-4 transition-all duration-200 hover:bg-amber-50/40 last:border-b-0 sm:grid-cols-[112px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-amber-50 ring-1 ring-amber-100/60 transition-all duration-200 group-hover:shadow-card">
          <Image src={productImage} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="128px" />
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div>
            <h3 className="text-base font-bold leading-tight text-zinc-950">{product.name}</h3>
            {product.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-500">{product.description}</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <strong className="text-base font-black text-ember-600">{formatCurrency(Number(product.price))}</strong>
            <button
              type="button"
              onClick={handleAdd}
              className="flex h-10 min-w-10 items-center justify-center rounded-full bg-ketchup px-3 font-bold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-warm hover:scale-110 active:scale-95"
              aria-label={`Adicionar ${product.name}`}
            >
              <Plus size={21} aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`confirm-options-title-${product.id}`}
            className="modal-enter relative w-full max-w-md rounded-2xl bg-white shadow-soft"
          >
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-5">
              <div className="min-w-0">
                <h3 id={`confirm-options-title-${product.id}`} className="text-lg font-black leading-tight text-zinc-950">
                  Adicionar produto
                </h3>
                <p className="mt-1 text-sm font-semibold leading-snug text-zinc-600">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Fechar"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm font-semibold leading-6 text-zinc-700">Deseja adicionar opcionais a este item?</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddWithoutOptions}
                  className="h-12 rounded-xl border border-zinc-200 bg-white px-4 font-bold text-zinc-700 transition hover:bg-zinc-50 active:scale-95"
                >
                  Nao
                </button>
                <button
                  type="button"
                  onClick={handleOpenOptions}
                  className="h-12 rounded-xl bg-ketchup px-4 font-black text-white shadow-sm transition hover:bg-red-700 hover:shadow-warm active:scale-95"
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {optionsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setOptionsOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`options-title-${product.id}`}
            className="modal-enter relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-soft"
          >
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 p-5">
              <div className="min-w-0">
                <h3 id={`options-title-${product.id}`} className="text-lg font-black leading-tight text-zinc-950">
                  Adicionais
                </h3>
                <p className="mt-1 text-sm font-semibold leading-snug text-zinc-600">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setOptionsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Fechar adicionais"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-5">
              <div className="grid gap-2">
                {productOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all duration-200 cursor-pointer ${
                      selectedOptionIds.includes(option.id)
                        ? "border-ketchup/30 bg-red-50 text-ketchup"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-amber-200 hover:bg-amber-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptionIds.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                      className="h-4 w-4 accent-ketchup"
                    />
                    <span className="min-w-0 flex-1 font-semibold leading-tight">{option.name}</span>
                    <span className="whitespace-nowrap font-black text-zinc-950">+{formatCurrency(option.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 p-5">
              <div className="flex items-center justify-between text-zinc-950">
                <span className="font-bold">Total do item</span>
                <strong className="text-xl font-black text-ember-600">{formatCurrency(Number(product.price) + selectedOptionsTotal)}</strong>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOptionsOpen(false)}
                  className="h-12 rounded-xl border border-zinc-200 bg-white px-4 font-bold text-zinc-700 transition hover:bg-zinc-50 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOptions}
                  className="h-12 rounded-xl bg-ketchup px-4 font-black text-white shadow-sm transition hover:bg-red-700 hover:shadow-warm active:scale-95"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}