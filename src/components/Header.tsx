import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import logoMark from "../../logo-tanifoods.png";

type HeaderProps = {
  cartCount: number;
};

export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200">
            <Image src={logoMark} alt="TaniFoods" fill className="object-cover" sizes="56px" priority />
          </div>
          <div>
            <h1 className="brand-wordmark text-2xl">TaniFoods</h1>
            <p className="text-xs font-semibold text-zinc-500">Hamburgueria e lanches</p>
          </div>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950">
          <ShoppingBag size={18} aria-hidden="true" />
          <span>{cartCount}</span>
        </div>
      </div>
    </header>
  );
}
