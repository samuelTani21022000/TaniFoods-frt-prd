import type { CartItem, Product, ProductOption } from "@/types";

const STORAGE_KEY = "tanifoods-cart";

export function getItemOptionsTotal(item: CartItem): number {
  return item.options.reduce((total, option) => total + Number(option.price), 0);
}

export function getItemUnitPrice(item: CartItem): number {
  return Number(item.product.price) + getItemOptionsTotal(item);
}

export function getItemSubtotal(item: CartItem): number {
  return getItemUnitPrice(item) * item.quantity;
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + getItemSubtotal(item), 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function buildCartItemId(product: Product, options: ProductOption[]): string {
  const optionIds = options.map((option) => option.id).sort().join(",");
  return `${product.id}:${optionIds}`;
}

export function addProduct(items: CartItem[], product: Product, options: ProductOption[] = []): CartItem[] {
  const selectedOptions = [...options].sort((first, second) => first.id.localeCompare(second.id));
  const itemId = buildCartItemId(product, selectedOptions);
  const current = items.find((item) => item.id === itemId);

  if (current) {
    return items.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  return [...items, { id: itemId, product, options: selectedOptions, quantity: 1 }];
}

export function updateQuantity(items: CartItem[], itemId: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== itemId);
  }

  return items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const items = raw ? (JSON.parse(raw) as CartItem[]) : [];

    return items.map((item) => ({
      ...item,
      id: item.id ?? buildCartItemId(item.product, item.options ?? []),
      options: item.options ?? []
    }));
  } catch {
    return [];
  }
}

export function clearStoredCart(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
