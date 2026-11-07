import crypto from 'crypto';
import supabase from './db-client.js';

export const DEFAULT_USER = 'admin';
export const DEFAULT_PASS = '5787';

export const hashPassword = (pass) =>
  crypto.createHash('sha256').update(`pathaayam::${pass}`).digest('hex');

const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY || 'pathaayam-local-secret';

export function makeToken(row) {
  return crypto
    .createHmac('sha256', secret())
    .update(`${row.id}:${row.username}:${row.password_hash}`)
    .digest('hex');
}

// Auto-initialises the default admin credentials when the admin table is empty.
export async function ensureAdmin() {
  const { data, error } = await supabase.from('admin').select('*').order('id', { ascending: true }).limit(1);
  if (error) throw error;
  if (data && data.length) return data[0];
  const { data: created, error: insErr } = await supabase
    .from('admin')
    .insert({ username: DEFAULT_USER, password_hash: hashPassword(DEFAULT_PASS) })
    .select('*')
    .single();
  if (insErr) throw insErr;
  return created;
}

export async function verifyAdmin(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return false;
  const row = await ensureAdmin();
  const expected = makeToken(row);
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
