export type Weight = { label: string; price: number };

export type Product = {
  id: number;
  name: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  category: string | null;
  badge: string | null;
  weights: Weight[];
  in_stock: boolean;
  sort_order: number;
};

export type ProductInput = Omit<Product, 'id'> & { id?: number };

export type Settings = Record<string, string>;

export type SyncState = 'idle' | 'saving' | 'synced' | 'error';

const TOKEN_KEY = 'pathaayam_admin_token';

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

async function request<T>(url: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = tokenStore.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
  let body: unknown = null;
  try { body = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const msg = (body as { error?: string } | null)?.error || `Request failed (${res.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return body as T;
}

export const api = {
  getProducts: () => request<Product[]>('/api/products'),
  getSettings: () => request<Settings>('/api/settings'),
  createProduct: (p: ProductInput) => request<Product>('/api/products', { method: 'POST', body: JSON.stringify(p) }, true),
  updateProduct: (p: ProductInput) => request<Product>('/api/products', { method: 'PUT', body: JSON.stringify(p) }, true),
  deleteProduct: (id: number) => request<{ ok: true }>('/api/products', { method: 'DELETE', body: JSON.stringify({ id }) }, true),
  saveSettings: (settings: Settings) => request<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify({ settings }) }, true),
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'login', username, password }) }),
  verify: () => request<{ ok: true; username: string }>('/api/admin', {}, true),
  changeCredentials: (password: string, newUsername: string, newPassword: string) =>
    request<{ token: string; username: string }>(
      '/api/admin',
      { method: 'POST', body: JSON.stringify({ action: 'change', password, newUsername, newPassword }) },
      true,
    ),
};

export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
