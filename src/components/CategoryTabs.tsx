import type { Category } from "@/types";

type CategoryTabsProps = {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
};

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-20 z-10 -mx-4 overflow-x-auto border-b border-zinc-200/80 bg-white px-4 py-3 shadow-sm md:static md:mx-0 md:rounded-xl md:border md:px-3 md:shadow-card">
      <div className="flex min-w-max gap-2">
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
            selected === "all" ? "bg-ketchup text-white shadow-warm" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onSelect(category.slug)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
              selected === category.slug ? "bg-ketchup text-white shadow-warm" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
