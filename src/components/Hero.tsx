import { motion } from 'framer-motion';
import { ArrowDown, MapPin, Mountain, Sprout } from 'lucide-react';
import type { Settings } from '../lib/api';

export default function Hero({ settings, productCount }: { settings: Settings; productCount: number }) {
  const headline = settings.hero_headline || 'Spices from the hills of Idukki';
  const words = headline.split(' ');
  const lastWord = words.pop();

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="leaf-pattern absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-6 lg:pr-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-leaf/25 bg-white/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-leaf"
          >
            <MapPin className="h-3.5 w-3.5" /> {settings.hero_eyebrow || 'Farm-fresh from Idukki, Kerala'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[2.75rem] font-medium leading-[1.02] tracking-tight text-forest sm:text-6xl lg:text-7xl"
          >
            {words.join(' ')}{' '}
            <em className="relative font-light italic text-leaf">
              {lastWord}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9C50 3 150 3 198 8" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-7 max-w-xl whitespace-pre-line text-lg leading-relaxed text-bark/75"
          >
            {settings.hero_intro || 'Hand-picked, sun-dried and packed at source.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a href="#shop" className="group flex items-center gap-2 rounded-full bg-forest px-7 py-4 font-semibold text-cream shadow-lg shadow-forest/20 transition hover:bg-leaf">
              Explore the harvest <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </a>
            <a href="#order" className="rounded-full px-5 py-4 font-semibold text-forest underline decoration-lime decoration-2 underline-offset-8 hover:text-leaf">
              How ordering works
            </a>
          </motion.div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-forest/10 pt-6">
            {[
              { icon: Mountain, k: '1,200m', v: 'Altitude grown' },
              { icon: Sprout, k: `${productCount || '—'}`, v: 'Spices in stock' },
              { icon: MapPin, k: '0', v: 'Middlemen' },
            ].map(({ icon: Icon, k, v }) => (
              <div key={v}>
                <Icon className="mb-2 h-4 w-4 text-leaf" />
                <div className="font-display text-2xl font-semibold text-forest">{k}</div>
                <div className="text-xs text-bark/60">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15 }}
          className="relative lg:col-span-6"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] rounded-tr-[8rem] shadow-2xl shadow-forest/25 sm:aspect-[5/5] lg:aspect-[4/5]">
            <img src="/images/hero.jpg" alt="Misty green plantation hills of Idukki" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-cream">
              <p className="font-display text-2xl italic leading-snug sm:text-3xl">“Grown where the mist meets the cardamom hills.”</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-lime">Western Ghats · Kerala</p>
            </div>
          </div>
          <div className="absolute -left-4 top-10 hidden rotate-[-6deg] rounded-2xl bg-cream p-4 shadow-xl sm:block">
            <img src="/images/cardamom.jpg" alt="" className="h-24 w-24 rounded-xl object-cover" />
            <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-widest text-forest">Queen of spices</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
