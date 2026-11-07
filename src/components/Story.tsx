import { Hand, Package, Sun, Truck } from 'lucide-react';
import type { Settings } from '../lib/api';

export default function Story({ settings }: { settings: Settings }) {
  const steps = [
    { icon: Hand, t: 'Hand-picked', d: 'Harvested by hand at peak ripeness on family plots across the Idukki highlands.' },
    { icon: Sun, t: 'Naturally dried', d: 'Slow sun and shade drying to lock in essential oils, colour and aroma.' },
    { icon: Package, t: 'Packed at source', d: 'Graded and sealed on the farm — no warehouses, no blending, no fillers.' },
    { icon: Truck, t: 'Shipped to you', d: 'Dispatched across India within 48 hours of your confirmed order.' },
  ];
  return (
    <>
      <section id="story" className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-leaf">Our Story</p>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-forest sm:text-5xl">
              <span className="italic">Pathaayam</span> — the granary of the hills.
            </h2>
            <p className="mt-6 leading-relaxed text-bark/75">
              In Malayalam homes, the pathaayam was the wooden chest where the family's finest harvest was kept safe.
              We carry that same care — bringing you the spices our farmers would keep for themselves.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {steps.map(({ icon: Icon, t, d }, i) => (
              <div key={t} className="relative rounded-3xl border border-forest/10 bg-white/60 p-6">
                <span className="absolute right-6 top-5 font-display text-5xl font-light text-forest/10">0{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-lime"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-display text-xl font-semibold text-forest">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bark/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order" className="relative overflow-hidden bg-forest py-20 text-cream">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-leaf/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-lime">How to Order</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-medium sm:text-5xl">Order in a message. No checkout, no fuss.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ['Pick your spice', 'Choose a weight tier and quantity on any product card.'],
              ['Tap Buy Now', 'Add your name and address — we pre-format the order for you.'],
              [
                'Send on WhatsApp or Instagram',
                `We confirm availability, share payment details and dispatch.${settings.instagram_handle ? ` Find us at @${settings.instagram_handle}.` : ''}`,
              ],
            ].map(([t, d], i) => (
              <div key={t} className="rounded-3xl border border-cream/15 bg-cream/5 p-7 backdrop-blur">
                <span className="font-display text-4xl italic text-lime">{i + 1}.</span>
                <h3 className="mt-3 text-lg font-bold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
