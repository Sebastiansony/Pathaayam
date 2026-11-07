import supabase from './db-client.js';
import { cors, verifyAdmin } from './_auth.js';

const ALLOWED = [
  'announcement',
  'hero_eyebrow',
  'hero_headline',
  'hero_intro',
  'whatsapp_number',
  'instagram_handle',
  'contact_email',
  'footer_note',
];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      const out = {};
      for (const r of data) out[r.key] = r.value ?? '';
      return res.status(200).json(out);
    }

    if (req.method === 'PUT') {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: 'Admin session required' });
      const incoming = (req.body && req.body.settings) || {};
      const rows = Object.entries(incoming)
        .filter(([k]) => ALLOWED.includes(k))
        .map(([key, value]) => ({ key, value: String(value ?? '').trim(), updated_at: new Date().toISOString() }));
      if (!rows.length) return res.status(400).json({ error: 'No valid settings provided' });

      if (incoming.whatsapp_number !== undefined) {
        const digits = String(incoming.whatsapp_number).replace(/\D/g, '');
        if (digits && (digits.length < 10 || digits.length > 15)) {
          return res.status(400).json({ error: 'WhatsApp number must include country code (10–15 digits)' });
        }
        rows.find((r) => r.key === 'whatsapp_number').value = digits;
      }
      if (incoming.instagram_handle !== undefined) {
        rows.find((r) => r.key === 'instagram_handle').value = String(incoming.instagram_handle).trim().replace(/^@/, '');
      }

      const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      const { data, error: e2 } = await supabase.from('settings').select('*');
      if (e2) throw e2;
      const out = {};
      for (const r of data) out[r.key] = r.value ?? '';
      return res.status(200).json(out);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
