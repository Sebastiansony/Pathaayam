import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { inr, type Product, type Weight } from '../lib/api';

type Props = { product: Product; index: number; onBuy: (p: Product, w: Weight, qty: number) => void };

export default function ProductCard({ product, index, onBuy }: Props) {
  const weights = Array.isArray(product.weights) ? product.weights : [];
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const current = weights[Math.min(sel, weights.length - 1)];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-forest/10 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-forest/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center font-display text-5xl text-forest/30">{product.name.charAt(0)}</div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.category && (
            <span className="rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-forest backdrop-blur">{product.category}</span>
          )}
          {product.badge && (
            <span className="rounded-full bg-saffron px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">{product.badge}</span>
          )}
        </div>
        {!product.in_stock && (
          <div className="absolute inset-0 grid place-items-center bg-bark/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-cream px-4 py-2 text-sm font-bold uppercase tracking-widest text-chili">Sold out</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-semibold text-forest">{product.name}</h3>
        {product.tagline && <p className="mt-1 text-sm font-medium text-leaf">{product.tagline}</p>}
        {product.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-bark/70">{product.description}</p>}

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-bark/50">Select weight</p>
          <div className="flex flex-wrap gap-2">
            {weights.map((w, i) => (
              <button
                key={`${w.label}-${i}`}
                onClick={() => setSel(i)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  i === sel ? 'border-forest bg-forest text-cream' : 'border-forest/20 text-forest hover:border-leaf hover:text-leaf'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="font-display text-3xl font-semibold text-bark">{current ? inr(current.price * qty) : '—'}</div>
              {current && qty > 1 && <div className="text-xs text-bark/50">{inr(current.price)} × {qty}</div>}
            </div>
            <div className="flex items-center rounded-full border border-forest/15 bg-cream">
              <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-9 w-9 place-items-center text-forest hover:text-leaf"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(50, q + 1))} className="grid h-9 w-9 place-items-center text-forest hover:text-leaf"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <button
            disabled={!product.in_stock || !current}
            onClick={() => current && onBuy(product, current, qty)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 font-semibold text-cream transition hover:bg-leaf disabled:cursor-not-allowed disabled:bg-bark/20 disabled:text-bark/50"
          >
            <ShoppingBag className="h-4 w-4" /> {product.in_stock ? 'Buy Now' : 'Currently unavailable'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
