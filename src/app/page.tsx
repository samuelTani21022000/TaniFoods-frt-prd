"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ShoppingBag, Star, X, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { Toast } from "@/components/Toast";
import { addProduct, clearStoredCart, getCartCount, getCartTotal, getItemSubtotal, getItemUnitPrice, loadCart, saveCart, updateQuantity } from "@/lib/cart";
import { formatCurrency, isValidBrazilianPhone } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CartItem, Category, CheckoutData, Product, ProductOption } from "@/types";
import logoHero from "../../logo-tanifoods.jpg";

const initialCheckout: CheckoutData = {
  customerName: "",
  customerPhone: "",
  deliveryType: "pickup",
  address: "",
  paymentMethod: "pix",
  notes: ""
};

function isMissingColumnError(errorMessage: string | undefined, column: string) {
  return Boolean(errorMessage?.includes(`column ${column} does not exist`));
}

function getSupabaseErrorMessage(error: { message?: string; details?: string | null; hint?: string | null }) {
  return [error.message, error.details, error.hint].filter(Boolean).join(" ");
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkout, setCheckout] = useState<CheckoutData>(initialCheckout);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [orderPanelOpen, setOrderPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (!orderPanelOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOrderPanelOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [orderPanelOpen]);

  useEffect(() => {
    async function loadMenu() {
      setLoadingMenu(true);
      setError(null);

      let supabase;

      try {
        supabase = getSupabaseClient();
      } catch (clientError) {
        setError(clientError instanceof Error ? clientError.message : "Configuracao do Supabase ausente.");
        setLoadingMenu(false);
        return;
      }

      let categoryResult = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name");

      if (isMissingColumnError(categoryResult.error?.message, "categories.is_active")) {
        categoryResult = await supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name");
      }

      let productResult = await supabase
        .from("products")
        .select("*, categories(id, name, slug, sort_order)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name");

      if (isMissingColumnError(productResult.error?.message, "products.is_active")) {
        productResult = await supabase
          .from("products")
          .select("*, categories(id, name, slug, sort_order)")
          .order("sort_order", { ascending: true })
          .order("name");
      }

      if (categoryResult.error || productResult.error) {
        setError(categoryResult.error?.message ?? productResult.error?.message ?? "Nao foi possivel carregar o cardapio.");
      } else {
        setCategories((categoryResult.data ?? []) as Category[]);
        setProducts((productResult.data ?? []) as Product[]);
      }

      setLoadingMenu(false);
    }

    loadMenu();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== "all") {
      result = result.filter((product) => product.categories?.slug === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = normalizeSearch(searchQuery);
      result = result.filter(
        (product) =>
          normalizeSearch(product.name).includes(query) ||
          (product.description && normalizeSearch(product.description).includes(query))
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const groupedProducts = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        products: filteredProducts.filter((product) => product.category_id === category.id)
      }))
      .filter((group) => group.products.length > 0);
  }, [categories, filteredProducts]);

  const subtotal = getCartTotal(cartItems);
  const deliveryFee = checkout.deliveryType === "delivery" ? 3 : 0;
  const total = subtotal + deliveryFee;
  const cartCount = getCartCount(cartItems);

  function validateCheckout(): string | null {
    if (cartItems.length === 0) {
      return "Adicione ao menos um produto ao carrinho.";
    }

    if (!checkout.customerName.trim()) {
      return "Informe o nome do cliente.";
    }

    if (!checkout.customerPhone.trim()) {
      return "Informe o telefone do cliente.";
    }

    if (!isValidBrazilianPhone(checkout.customerPhone)) {
      return "Informe um telefone valido com DDD. Ex: (18) 99999-9999.";
    }

    if (checkout.deliveryType === "delivery" && !checkout.address.trim()) {
      return "Informe o endereco para entrega.";
    }

    return null;
  }

  async function handleSubmitOrder() {
    const validationError = validateCheckout();

    if (validationError) {
      setError(validationError);
      setOrderPanelOpen(true);
      return;
    }

    const orderId = crypto.randomUUID();

    setSubmitting(true);
    setError(null);
    setSuccessOrderId(null);

    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch (clientError) {
      setError(clientError instanceof Error ? clientError.message : "Configuracao do Supabase ausente.");
      setSubmitting(false);
      return;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        customer_name: checkout.customerName.trim(),
        customer_phone: checkout.customerPhone.trim(),
        delivery_type: checkout.deliveryType === "delivery" ? "entrega" : "retirada",
        address: checkout.deliveryType === "delivery" ? checkout.address.trim() : null,
        payment_method: checkout.paymentMethod,
        notes: checkout.notes.trim() || null,
        subtotal,
        total
      });

    if (orderError) {
      setError(getSupabaseErrorMessage(orderError) || "Nao foi possivel salvar o pedido.");
      setSubmitting(false);
      return;
    }

    const itemsPayload = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name:
        item.options.length > 0
          ? `${item.product.name} - adicionais: ${item.options
              .map((option) => `${option.name} ${option.price.toFixed(2)} x ${item.quantity} = ${(option.price * item.quantity).toFixed(2)}`)
              .join(", ")}`
          : item.product.name,
      quantity: item.quantity,
      unit_price: getItemUnitPrice(item),
      subtotal: getItemSubtotal(item)
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload);

    if (itemsError) {
      setError(getSupabaseErrorMessage(itemsError));
      setSubmitting(false);
      return;
    }

    const message = buildWhatsAppMessage(orderId, checkout, cartItems, total);
    const whatsappUrl = buildWhatsAppUrl(message);

    setCartItems([]);
    clearStoredCart();
    setSuccessOrderId(orderId);
    setCheckout(initialCheckout);
    setSubmitting(false);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function handleAddProduct(product: Product, options: ProductOption[]) {
    setCartItems((items) => addProduct(items, product, options));
    setSuccessOrderId(null);
    setToastMessage(`${product.name} adicionado ao carrinho!`);
  }

  return (
    <main className="min-h-screen bg-cream pb-28 xl:pb-12">
      <Header cartCount={cartCount} />

      <section className="border-b border-amber-100/80 bg-white bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
          <div className="grid gap-5 sm:grid-cols-[148px_1fr] sm:items-center md:grid-cols-[180px_1fr]">
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl bg-amber-50 shadow-warm ring-1 ring-amber-100 sm:mx-0 md:h-44 md:w-44">
              <Image src={logoHero} alt="TaniFoods" fill className="object-cover" sizes="(min-width: 768px) 176px, 144px" priority />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Aberto para pedidos
              </p>
              <h2 className="brand-wordmark brand-wordmark-hero mt-2 text-5xl md:text-7xl">TaniFoods</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500 md:text-base">Hamburgueria, porcoes e bebidas com pedido direto pelo WhatsApp.</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-zinc-600 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-100">
                  <Star className="fill-gold-400 text-gold-500" size={14} aria-hidden="true" />
                  4.9
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600">Pedido pelo WhatsApp</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600">Retirada ou entrega</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 pb-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0">
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardapio..."
              className="h-11 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-10 text-sm font-medium text-zinc-800 shadow-card transition focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Limpar busca"
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="mt-3">
            <CategoryTabs categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
          </div>

          {error && !submitting ? (
            <div className="mt-4 flex gap-3 rounded-xl border border-red-100 bg-white p-4 text-sm font-bold text-ketchup shadow-card">
              <AlertTriangle size={20} aria-hidden="true" />
              {error}
            </div>
          ) : null}

          {loadingMenu ? (
            <div className="mt-5 grid gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-xl bg-white shadow-card" />
              ))}
            </div>
          ) : groupedProducts.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-card">
              <Search size={40} className="text-zinc-300" aria-hidden="true" />
              <p className="mt-3 text-base font-bold text-zinc-700">Nenhum produto encontrado</p>
              <p className="mt-1 text-sm text-zinc-500">Tente buscar por outro termo ou categoria.</p>
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-200"
                >
                  Limpar busca
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {groupedProducts.map((group) => (
                <section key={group.category.id} className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-card">
                  <h2 className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 text-base font-black uppercase tracking-wide text-zinc-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-ketchup" />
                    {group.category.name}
                  </h2>
                  <div>
                    {group.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={handleAddProduct}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="hidden space-y-4 xl:sticky xl:top-24 xl:block xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1">
          <OrderSuccess orderId={successOrderId} />
          <CheckoutForm
            data={checkout}
            disabled={cartItems.length === 0}
            loading={submitting}
            error={submitting ? error : null}
            onChange={setCheckout}
            onSubmit={handleSubmitOrder}
          />
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-100 bg-white/95 px-4 py-3 shadow-[0_-12px_40px_rgba(220,38,38,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={() => setOrderPanelOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left transition hover:border-amber-200 hover:bg-amber-50/50"
            aria-label="Abrir resumo do pedido"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-ketchup">
              <ShoppingBag size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-zinc-950">
                {cartCount > 0 ? `${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "Carrinho vazio"}
              </span>
              <span className="block text-sm font-bold text-zinc-600">{formatCurrency(total)}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderPanelOpen(true)}
            disabled={cartItems.length === 0}
            className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-ketchup px-5 text-sm font-black text-white shadow-warm transition hover:bg-red-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none sm:px-6"
          >
            {cartItems.length === 0 ? "Adicione itens" : "Finalizar"}
          </button>
        </div>
      </div>

      {orderPanelOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-panel-title"
            className="modal-enter relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-cream shadow-2xl sm:max-w-5xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <h2 id="order-panel-title" className="text-lg font-black text-zinc-950">
                  Finalizar pedido
                </h2>
                <p className="text-sm font-semibold text-zinc-500">
                  Revise o carrinho e informe seus dados para envio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderPanelOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Fechar finalizacao do pedido"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                <div className="space-y-4">
                  <OrderSuccess orderId={successOrderId} />
                  <Cart
                    items={cartItems}
                    deliveryType={checkout.deliveryType}
                    onQuantityChange={(itemId, quantity) => setCartItems((items) => updateQuantity(items, itemId, quantity))}
                  />
                </div>
                <CheckoutForm
                  data={checkout}
                  disabled={cartItems.length === 0}
                  loading={submitting}
                  error={error}
                  onChange={setCheckout}
                  onSubmit={handleSubmitOrder}
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {toastMessage ? <Toast message={toastMessage} onClose={() => setToastMessage(null)} /> : null}
    </main>
  );
}
