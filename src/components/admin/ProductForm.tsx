import { useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import type { Product, ProductInput, Weight } from '../../lib/api';

type Props = {
  initial: Product | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (p: ProductInput) => void;
};

const empty: ProductInput = {
  name: '', tagline: '', description: '', image_url: '', category: '', badge: '',
  weights: [{ label: '250g', price: 0 }], in_stock: true, sort_order: 0,
};

type WeightRow = { label: string; price: string };

export default function ProductForm({ initial, saving, onCancel, onSave }: Props) {
  const [f, setF] = useState<ProductInput>(initial ? { ...initial } : { ...empty });
  const [rows, setRows] = useState<WeightRow[]>(
    (initial?.weights?.length ? initial.weights : empty.weights).map((w) => ({ label: w.label, price: w.price ? String(w.price) : '' })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = 'Name is required';
    const weights: Weight[] = rows
      .filter((r) => r.label.trim() || r.price.trim())
      .map((r) => ({ label: r.label.trim(), price: Number(r.price) }));
    if (!weights.length) errs.weights = 'Add at least one weight tier';
    else if (weights.some((w) => !w.label)) errs.weights = 'Every tier needs a label (e.g. 1.5kg)';
    else if (weights.some((w) => !Number.isFinite(w.price) || w.price <= 0)) errs.weights = 'Every tier needs a price greater than 0';
    else if (new Set(weights.map((w) => w.label.toLowerCase())).size !== weights.length) errs.weights = 'Weight labels must be unique';
    if (f.image_url && !/^(https?:\/\/|\/)/.test(f.image_url)) errs.image_url = 'Use a full https:// URL or a /images/ path';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...f, weights, id: initial?.id });
  };

  const input = 'w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-lime/20';
  const label = 'mb-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-bark/60';

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-forest/10 bg-white/70 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-forest">{initial ? `Edit: ${initial.name}` : 'Add new product'}</h3>
        <button type="button" onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-full hover:bg-forest/10"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name *</label>
          <input className={input} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Green Cardamom" />
          {errors.name && <p className="mt-1 text-xs text-chili">{errors.name}</p>}
        </div>
        <div>
          <label className={label}>Tagline</label>
          <input className={input} value={f.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} placeholder="8mm bold pods" />
        </div>
        <div>
          <label className={label}>Category</label>
          <input className={input} value={f.category ?? ''} onChange={(e) => set('category', e.target.value)} placeholder="Whole Spices" />
        </div>
        <div>
          <label className={label}>Badge</label>
          <input className={input} value={f.badge ?? ''} onChange={(e) => set('badge', e.target.value)} placeholder="Bestseller" />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Image URL</label>
          <div className="flex gap-3">
            <input className={input} value={f.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://… or /images/cardamom.jpg" />
            {f.image_url && <img src={f.image_url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />}
          </div>
          {errors.image_url && <p className="mt-1 text-xs text-chili">{errors.image_url}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Description</label>
          <textarea className={`${input} min-h-[80px]`} value={f.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={label}>Weight tiers (stored as an array)</label>
          <button type="button" onClick={() => setRows((r) => [...r, { label: '', price: '' }])} className="inline-flex items-center gap-1 rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold text-forest hover:bg-forest hover:text-cream">
            <Plus className="h-3.5 w-3.5" /> Add tier
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className={input} placeholder="Label e.g. 1.5kg" value={r.label} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <div className="relative w-40 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-bark/50">₹</span>
                <input className={`${input} pl-7`} type="number" min="0" step="1" placeholder="Price" value={r.price} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
              </div>
              <button type="button" disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="grid w-10 shrink-0 place-items-center rounded-xl text-chili hover:bg-chili/10 disabled:opacity-30" aria-label="Remove tier">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {errors.weights && <p className="mt-1 text-xs text-chili">{errors.weights}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={f.in_stock} onChange={(e) => set('in_stock', e.target.checked)} className="h-4 w-4 accent-[#15803d]" /> In stock
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          Display order
          <input type="number" className="w-20 rounded-lg border border-forest/15 bg-white px-2 py-1" value={f.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-2.5 text-sm font-semibold text-bark/70 hover:bg-forest/5">Cancel</button>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-leaf disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : initial ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  );
}
