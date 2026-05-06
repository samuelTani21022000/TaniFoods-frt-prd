import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import logoMark from "../../logo-tanifoods.png";

type HeaderProps = {
  cartCount: number;
};

export function Header({ cartCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-amber-100/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-amber-50 shadow-warm ring-1 ring-amber-100">
            <Image src={logoMark} alt="TaniFoods" fill className="object-cover" sizes="56px" priority />
          </div>
          <div>
            <h1 className="brand-wordmark text-2xl">TaniFoods</h1>
            <p className="text-xs font-semibold text-zinc-500">Hamburgueria e lanches</p>
          </div>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950 shadow-card">
          <ShoppingBag size={18} aria-hidden="true" />
          <span key={cartCount} className={cartCount > 0 ? "animate-badge-bounce" : ""}>
            {cartCount}
          </span>
        </div>
      </div>
    </header>
  );
}
