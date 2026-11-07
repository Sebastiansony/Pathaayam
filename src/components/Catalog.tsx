import { useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product, Weight } from '../lib/api';

type Props = {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBuy: (p: Product, w: Weight, qty: number) => void;
};

export default function Catalog({ products, loading, error, onRetry, onBuy }: Props) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))],
    [products],
  );

  const filtered = products.filter((p) => {
    const okCat = cat === 'All' || p.category === cat;
    const s = q.trim().toLowerCase();
    const okQ = !s || [p.name, p.tagline, p.description].some((t) => t?.toLowerCase().includes(s));
    return okCat && okQ;
  });

  return (
    <section id="shop" className="relative bg-parchment/60 py-20 grain">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-leaf">The Harvest</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">Straight from our <em className="italic text-leaf">estate</em></h2>
          </div>
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bark/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cardamom, pepper…"
              className="w-full rounded-full border border-forest/15 bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-lime/20"
            />
          </label>
        </div>

        {categories.length > 2 && (
          <div className="scrollbar-thin mt-8 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cat === c ? 'bg-forest text-cream' : 'bg-white/70 text-forest hover:bg-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-[1.75rem] bg-white/60">
                  <div className="aspect-[4/3] bg-forest/10" />
                  <div className="space-y-3 p-6">
                    <div className="h-6 w-2/3 rounded bg-forest/10" />
                    <div className="h-4 w-full rounded bg-forest/10" />
                    <div className="h-10 w-full rounded-full bg-forest/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md rounded-3xl border border-chili/20 bg-white/80 p-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-chili" />
              <p className="mt-3 font-semibold text-bark">Couldn't load the catalogue</p>
              <p className="mt-1 text-sm text-bark/60">{error}</p>
              <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-leaf">
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-bark/60">No spices match your search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onBuy={onBuy} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
