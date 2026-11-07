import { Instagram, Leaf, Mail, MessageCircle } from 'lucide-react';
import type { Settings } from '../lib/api';

export default function Footer({ settings, onAdmin }: { settings: Settings; onAdmin: () => void }) {
  return (
    <footer className="bg-forest-deep text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-lime" />
            <span className="font-display text-2xl font-semibold text-cream">Pathaayam</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">{settings.footer_note || 'Authentic spices from Idukki, Kerala.'}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">Reach us</p>
          {settings.whatsapp_number && (
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-lime">
              <MessageCircle className="h-4 w-4" /> +{settings.whatsapp_number}
            </a>
          )}
          {settings.instagram_handle && (
            <a href={`https://instagram.com/${settings.instagram_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-lime">
              <Instagram className="h-4 w-4" /> @{settings.instagram_handle}
            </a>
          )}
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-lime">
              <Mail className="h-4 w-4" /> {settings.contact_email}
            </a>
          )}
        </div>
        <div className="text-sm md:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">Origin</p>
          <p className="mt-3">Idukki District, Kerala, India</p>
          <button onClick={onAdmin} className="mt-6 text-xs text-cream/40 underline-offset-4 hover:text-cream hover:underline">Admin panel</button>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/40">© {new Date().getFullYear()} Pathaayam Spices. All rights reserved.</div>
    </footer>
  );
}
