import supabase from './db-client.js';
import { cors, ensureAdmin, hashPassword, makeToken, verifyAdmin } from './_auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const ok = await verifyAdmin(req);
      if (!ok) return res.status(401).json({ error: 'Session expired' });
      const row = await ensureAdmin();
      return res.status(200).json({ ok: true, username: row.username });
    }

    if (req.method === 'POST') {
      const { action, username, password, newUsername, newPassword } = req.body || {};

      if (action === 'login') {
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        const row = await ensureAdmin();
        if (row.username !== String(username).trim() || row.password_hash !== hashPassword(String(password))) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }
        return res.status(200).json({ token: makeToken(row), username: row.username });
      }

      if (action === 'change') {
        const ok = await verifyAdmin(req);
        if (!ok) return res.status(401).json({ error: 'Session expired' });
        const row = await ensureAdmin();
        if (row.password_hash !== hashPassword(String(password || ''))) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const u = String(newUsername || row.username).trim();
        if (u.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (newPassword && String(newPassword).length < 4) {
          return res.status(400).json({ error: 'New password must be at least 4 characters' });
        }
        const update = { username: u };
        if (newPassword) update.password_hash = hashPassword(String(newPassword));
        const { data, error } = await supabase.from('admin').update(update).eq('id', row.id).select('*').single();
        if (error) throw error;
        return res.status(200).json({ token: makeToken(data), username: data.username });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
