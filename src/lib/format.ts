export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function parseMoney(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidBrazilianPhone(value: string): boolean {
  const phone = normalizePhone(value);
  const withoutCountryCode = phone.startsWith("55") && phone.length > 11 ? phone.slice(2) : phone;

  if (!/^\d{10,11}$/.test(withoutCountryCode)) {
    return false;
  }

  const ddd = Number(withoutCountryCode.slice(0, 2));

  if (ddd < 11 || ddd > 99) {
    return false;
  }

  if (withoutCountryCode.length === 11 && withoutCountryCode[2] !== "9") {
    return false;
  }

  return true;
}

export function orderShortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
