import type { Product } from "@/types";

const imageByKind = {
  pastel: "/images/cardapio/pastel.svg",
  burger: "/images/cardapio/burger.svg",
  hotdog: "/images/cardapio/hotdog.svg",
  portion: "/images/cardapio/portion.svg",
  soda: "/images/cardapio/soda.svg",
  beer: "/images/cardapio/beer.svg",
  water: "/images/cardapio/water.svg",
  default: "/images/cardapio/default.svg"
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getProductImage(product: Product): string {
  if (product.image_url) {
    return product.image_url;
  }

  const searchable = normalize(`${product.name} ${product.categories?.name ?? ""} ${product.categories?.slug ?? ""}`);

  if (searchable.includes("pastel")) {
    return imageByKind.pastel;
  }

  if (searchable.includes("hamb") || searchable.includes("lanche") || searchable.includes("artesanal") || searchable.startsWith("x-")) {
    return imageByKind.burger;
  }

  if (searchable.includes("dog")) {
    return imageByKind.hotdog;
  }

  if (searchable.includes("porcao") || searchable.includes("batata") || searchable.includes("mandioca") || searchable.includes("tilapia")) {
    return imageByKind.portion;
  }

  if (searchable.includes("refrigerante") || searchable.includes("coca") || searchable.includes("fanta") || searchable.includes("guarana")) {
    return imageByKind.soda;
  }

  if (searchable.includes("cerveja") || searchable.includes("brahma") || searchable.includes("skol") || searchable.includes("heineken")) {
    return imageByKind.beer;
  }

  if (searchable.includes("agua")) {
    return imageByKind.water;
  }

  return imageByKind.default;
}
