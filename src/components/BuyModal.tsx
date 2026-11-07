import { useEffect, useState } from 'react';
import { Check, Copy, Instagram, MessageCircle } from 'lucide-react';
import Modal from './Modal';
import { inr, type Product, type Settings, type Weight } from '../lib/api';

export type BuyItem = { product: Product; weight: Weight; qty: number } | null;

export default function BuyModal({ item, settings, onClose }: { item: BuyItem; settings: Settings; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) { setQty(item.qty); setErrors({}); setCopied(false); }
  }, [item]);

  if (!item) return <Modal open={false} onClose={onClose}>{null}</Modal>;
  const total = item.weight.price * qty;

  const message = [
    `Hello Pathaayam! 🌿 I'd like to place an order:`,
    ``,
    `🛍️ Product: ${item.product.name}`,
    `⚖️ Weight: ${item.weight.label}`,
    `🔢 Quantity: ${qty}`,
    `💰 Price: ${inr(item.weight.price)} × ${qty} = ${inr(total)}`,
    ``,
    `👤 Name: ${name.trim()}`,
    phone.trim() ? `📞 Phone: ${phone.trim()}` : '',
    address.trim() ? `📍 Address: ${address.trim()}` : '',
    note.trim() ? `📝 Note: ${note.trim()}` : '',
  ].filter((l, i, arr) => l !== '' || (arr[i - 1] !== '' && i < arr.length - 1)).join('\n').trim();

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Please enter your name';
    if (phone.trim() && !/^[+\d][\d\s-]{7,16}$/.test(phone.trim())) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendWhatsApp = () => {
    if (!validate()) return;
    if (!settings.whatsapp_number) { setErrors({ channel: 'WhatsApp ordering is not configured yet.' }); return; }
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  const sendInstagram = async () => {
    if (!validate()) return;
    if (!settings.instagram_handle) { setErrors({ channel: 'Instagram ordering is not configured yet.' }); return; }
    try { await navigator.clipboard.writeText(message); setCopied(true); } catch { setCopied(false); }
    setTimeout(() => window.open(`https://ig.me/m/${settings.instagram_handle}`, '_blank', 'noopener'), 700);
  };

  const field = 'w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-lime/20';

  return (
    <Modal open={!!item} onClose={onClose} title={<p className="font-display text-xl font-semibold text-forest">Complete your order</p>}>
      <div className="space-y-5 p-6">
        <div className="flex gap-4 rounded-3xl bg-white p-3">
          {item.product.image_url && <img src={item.product.image_url} alt="" className="h-20 w-20 rounded-2xl object-cover" />}
          <div className="flex-1">
            <p className="font-display text-lg font-semibold text-forest">{item.product.name}</p>
            <p className="text-sm text-bark/60">{item.weight.label} · {inr(item.weight.price)} each</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-bark/60">Qty</span>
                <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="rounded-lg border border-forest/15 bg-cream px-2 py-1 font-semibold">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <span className="font-display text-xl font-semibold">{inr(total)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <input className={field} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="mt-1 pl-2 text-xs text-chili">{errors.name}</p>}
          </div>
          <div>
            <input className={field} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors.phone && <p className="mt-1 pl-2 text-xs text-chili">{errors.phone}</p>}
          </div>
          <textarea className={`${field} min-h-[72px] resize-none`} placeholder="Delivery address with PIN code (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input className={field} placeholder="Note for us (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <details className="rounded-2xl bg-parchment/70 p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-forest">Preview message</summary>
          <pre className="mt-3 whitespace-pre-wrap font-body text-xs leading-relaxed text-bark/80">{message}</pre>
        </details>

        {errors.channel && <p className="rounded-xl bg-chili/10 px-4 py-2 text-sm text-chili">{errors.channel}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={sendWhatsApp} className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-semibold text-white transition hover:brightness-95">
            <MessageCircle className="h-5 w-5" /> Order on WhatsApp
          </button>
          <button onClick={sendInstagram} className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] py-3.5 font-semibold text-white transition hover:brightness-95">
            {copied ? <Check className="h-5 w-5" /> : <Instagram className="h-5 w-5" />} {copied ? 'Copied — opening…' : 'Order on Instagram'}
          </button>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-bark/50">
          <Copy className="h-3 w-3" /> Instagram: your order is copied — just paste it in the DM{settings.instagram_handle ? ` to @${settings.instagram_handle}` : ''}.
        </p>
      </div>
    </Modal>
  );
}
