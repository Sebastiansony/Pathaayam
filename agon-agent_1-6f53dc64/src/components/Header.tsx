import { Leaf, Lock, ShoppingBag } from 'lucide-react';

type Props = { announcement?: string; onAdmin: () => void };

export default function Header({ announcement, onAdmin }: Props) {
  return (
    <header className="sticky top-0 z-40">
      {announcement && (
        <div className="overflow-hidden bg-forest-deep text-cream/90 text-[11px] tracking-[0.2em] uppercase">
          <div className="flex w-max animate-marquee gap-16 py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap">
                <Leaf className="h-3 w-3 text-lime" /> {announcement}
              </span>
            ))}
          </div>
        </div>
      )}
      <nav className="border-b border-forest/10 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-cream shadow-inner">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-2xl font-semibold tracking-tight text-forest">Pathaayam</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-leaf">Idukki · Kerala</span>
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-bark/80 md:flex">
            <a href="#shop" className="hover:text-forest">Shop</a>
            <a href="#story" className="hover:text-forest">Our Story</a>
            <a href="#order" className="hover:text-forest">How to Order</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAdmin}
              aria-label="Admin login"
              className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 text-forest/70 transition hover:bg-forest hover:text-cream"
            >
              <Lock className="h-4 w-4" />
            </button>
            <a
              href="#shop"
              className="flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-leaf"
            >
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Shop Spices</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
