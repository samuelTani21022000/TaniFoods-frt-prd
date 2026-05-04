"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSuccess } from "@/components/OrderSuccess";
import { addProduct, clearStoredCart, getCartCount, getCartTotal, getItemSubtotal, getItemUnitPrice, loadCart, saveCart, updateQuantity } from "@/lib/cart";
import { isValidBrazilianPhone } from "@/lib/format";
import { getSupabaseClient } from "@/lib/supabase";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { CartItem, Category, CheckoutData, Product } from "@/types";
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

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

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
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name");

      if (isMissingColumnError(categoryResult.error?.message, "categories.active")) {
        categoryResult = await supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name");
      }

      let productResult = await supabase
        .from("products")
        .select("*, categories(id, name, slug, sort_order)")
        .eq("available", true)
        .order("sort_order", { ascending: true })
        .order("name");

      if (isMissingColumnError(productResult.error?.message, "products.available")) {
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
    if (selectedCategory === "all") {
      return products;
    }

    return products.filter((product) => product.categories?.slug === selectedCategory);
  }, [products, selectedCategory]);

  const groupedProducts = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        products: filteredProducts.filter((product) => product.category_id === category.id)
      }))
      .filter((group) => group.products.length > 0);
  }, [categories, filteredProducts]);

  const total = getCartTotal(cartItems);
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
        subtotal: total,
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

  return (
    <main className="min-h-screen bg-zinc-100">
      <Header cartCount={cartCount} />

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
          <div className="grid gap-5 sm:grid-cols-[148px_1fr] sm:items-center md:grid-cols-[180px_1fr]">
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 sm:mx-0 md:h-44 md:w-44">
              <Image src={logoHero} alt="TaniFoods" fill className="object-cover" sizes="(min-width: 768px) 176px, 144px" priority />
            </div>
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-sm font-bold text-ketchup">Aberto para pedidos</p>
              <h2 className="brand-wordmark brand-wordmark-hero mt-1 text-5xl md:text-7xl">TaniFoods</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500 md:text-base">Hamburgueria, porcoes e bebidas com pedido direto pelo WhatsApp.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1">
                  <Star className="fill-ketchup text-ketchup" size={14} aria-hidden="true" />
                  4.9
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Pedido pelo WhatsApp</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">Retirada ou entrega</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 pb-12 xl:grid-cols-[minmax(0,1fr)_330px_360px] xl:items-start">
        <div className="min-w-0">
          <CategoryTabs categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

          {error && !submitting ? (
            <div className="mt-4 flex gap-3 rounded-lg border border-red-100 bg-white p-4 text-sm font-bold text-ketchup">
              <AlertTriangle size={20} aria-hidden="true" />
              {error}
            </div>
          ) : null}

          {loadingMenu ? (
            <div className="mt-5 grid gap-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : groupedProducts.length === 0 ? (
            <p className="mt-5 rounded-lg border border-zinc-200 bg-white p-5 text-zinc-600">Nenhum produto disponivel no momento.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {groupedProducts.map((group) => (
                <section key={group.category.id} className="rounded-lg border border-zinc-200 bg-white px-4">
                  <h2 className="border-b border-zinc-100 py-4 text-lg font-black text-zinc-950">{group.category.name}</h2>
                  <div>
                    {group.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={(selectedProduct, selectedOptions) => {
                          setCartItems((items) => addProduct(items, selectedProduct, selectedOptions));
                          setSuccessOrderId(null);
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)]">
          <Cart items={cartItems} onQuantityChange={(itemId, quantity) => setCartItems((items) => updateQuantity(items, itemId, quantity))} />
        </aside>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1">
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
    </main>
  );
}
