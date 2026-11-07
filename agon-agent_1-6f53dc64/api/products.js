import supabase from './db-client.js';
import { cors, verifyAdmin } from './_auth.js';

// Weight tiers are always stored as an ARRAY of { label, price } objects —
// never as an object keyed by label (labels like "1.5kg" would break key rules).
function sanitizeWeights(weights) {
  if (!Array.isArray(weights)) throw new Error('Weights must be an array of { label, price }');
  const cleaned = weights
    .map((w) => ({ label: String(w?.label ?? '').trim(), price: Number(w?.price) }))
    .filter((w) => w.label);
  if (!cleaned.length) throw new Error('Add at least one weight tier');
  const seen = new Set();
  for (const w of cleaned) {
    if (!Number.isFinite(w.price) || w.price <= 0) throw new Error(`Invalid price for "${w.label}"`);
    const k = w.label.toLowerCase();
    if (seen.has(k)) throw new Error(`Duplicate weight label "${w.label}"`);
    seen.add(k);
    w.price = Math.round(w.price * 100) / 100;
  }
  return cleaned;
}

function buildRow(body) {
  const name = String(body.name ?? '').trim();
  if (!name) throw new Error('Product name is required');
  return {
    name,
    tagline: body.tagline ? String(body.tagline).trim() : null,
    description: body.description ? String(body.description).trim() : null,
    image_url: body.image_url ? String(body.image_url).trim() : null,
    category: body.category ? String(body.category).trim() : null,
    badge: body.badge ? String(body.badge).trim() : null,
    weights: sanitizeWeights(body.weights),
    in_stock: body.in_stock !== false,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (!(await verifyAdmin(req))) return res.status(401).json({ error: 'Admin session required' });

    if (req.method === 'POST') {
      let row;
      try { row = buildRow(req.body || {}); } catch (e) { return res.status(400).json({ error: e.message }); }
      const { data, error } = await supabase.from('products').insert(row).select('*').single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Product id is required' });
      let row;
      try { row = buildRow(req.body || {}); } catch (e) { return res.status(400).json({ error: e.message }); }
      row.updated_at = new Date().toISOString();
      const { data, error } = await supabase.from('products').update(row).eq('id', id).select('*').single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const id = (req.body && req.body.id) || req.query.id;
      if (!id) return res.status(400).json({ error: 'Product id is required' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
