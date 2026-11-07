import { useEffect, useState } from 'react';
import { KeyRound, LayoutGrid, Loader2, LogOut, Pencil, Plus, Save, Share2, ShieldCheck, Trash2, Type } from 'lucide-react';
import Modal from '../Modal';
import SyncBadge from './SyncBadge';
import ProductForm from './ProductForm';
import { api, inr, tokenStore, type Product, type ProductInput, type Settings, type SyncState } from '../../lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  products: Product[];
  settings: Settings;
  onRefresh: () => Promise<void>;
};

type Tab = 'products' | 'text' | 'contacts' | 'security';

export default function AdminModal({ open, onClose, products, settings, onRefresh }: Props) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [sync, setSync] = useState<SyncState>('idle');
  const [syncMsg, setSyncMsg] = useState('');
  const [tab, setTab] = useState<Tab>('products');
  const [editing, setEditing] = useState<Product | null | 'new'>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [draft, setDraft] = useState<Settings>({});
  const [sec, setSec] = useState({ current: '', newUser: '', newPass: '', confirm: '' });
  const [secErr, setSecErr] = useState('');
  const [secOk, setSecOk] = useState('');

  useEffect(() => { setDraft(settings); }, [settings, open]);

  useEffect(() => {
    if (!open || authed || !tokenStore.get()) return;
    setChecking(true);
    api.verify()
      .then((r) => { setAuthed(true); setSec((s) => ({ ...s, newUser: r.username })); })
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, [open, authed]);

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setSync('saving'); setSyncMsg('');
    try {
      await fn();
      await onRefresh();
      setSync('synced'); setSyncMsg(okMsg);
      return true;
    } catch (e) {
      const err = e as Error & { status?: number };
      setSync('error'); setSyncMsg(err.message);
      if (err.status === 401) { tokenStore.clear(); setAuthed(false); }
      return false;
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    if (!username.trim() || !password) { setLoginErr('Enter username and password'); return; }
    setLoggingIn(true);
    try {
      const r = await api.login(username.trim(), password);
      tokenStore.set(r.token);
      setAuthed(true); setPassword(''); setSync('synced'); setSyncMsg('Signed in');
      setSec((s) => ({ ...s, newUser: r.username }));
    } catch (err) {
      setLoginErr((err as Error).message);
    } finally { setLoggingIn(false); }
  };

  const logout = () => { tokenStore.clear(); setAuthed(false); setSync('idle'); setEditing(null); };

  const saveProduct = async (p: ProductInput) => {
    const ok = await run(() => (p.id ? api.updateProduct(p) : api.createProduct(p)), p.id ? 'Product updated' : 'Product created');
    if (ok) setEditing(null);
  };

  const removeProduct = async (id: number) => {
    await run(() => api.deleteProduct(id), 'Product deleted');
    setConfirmDel(null);
  };

  const saveSettings = (keys: string[]) => {
    const subset: Settings = {};
    keys.forEach((k) => { subset[k] = draft[k] ?? ''; });
    run(() => api.saveSettings(subset), 'Storefront updated');
  };

  const changeCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecErr(''); setSecOk('');
    if (!sec.current) return setSecErr('Enter your current password');
    if (sec.newUser.trim().length < 3) return setSecErr('Username must be at least 3 characters');
    if (sec.newPass && sec.newPass.length < 4) return setSecErr('New password must be at least 4 characters');
    if (sec.newPass !== sec.confirm) return setSecErr('New passwords do not match');
    setSync('saving');
    try {
      const r = await api.changeCredentials(sec.current, sec.newUser.trim(), sec.newPass);
      tokenStore.set(r.token);
      setSec({ current: '', newUser: r.username, newPass: '', confirm: '' });
      setSecOk('Credentials updated'); setSync('synced'); setSyncMsg('Credentials updated');
    } catch (err) {
      setSecErr((err as Error).message); setSync('error'); setSyncMsg((err as Error).message);
    }
  };

  const input = 'w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-lime/20';
  const label = 'mb-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-bark/60';

  const title = (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 font-display text-xl font-semibold text-forest"><ShieldCheck className="h-5 w-5 text-leaf" /> Pathaayam Admin</span>
      {authed && <SyncBadge state={sync} />}
    </div>
  );

  if (!authed) {
    return (
      <Modal open={open} onClose={onClose} title={title}>
        {checking ? (
          <div className="flex items-center justify-center gap-2 p-12 text-forest"><Loader2 className="h-5 w-5 animate-spin" /> Verifying session…</div>
        ) : (
          <form onSubmit={login} className="space-y-4 p-6">
            <p className="text-sm text-bark/70">Sign in to manage products, storefront text and contact channels.</p>
            <div>
              <label className={label}>Username</label>
              <input className={input} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className={label}>Password</label>
              <input className={input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {loginErr && <p className="rounded-xl bg-chili/10 px-3 py-2 text-sm text-chili">{loginErr}</p>}
            <button disabled={loggingIn} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 font-semibold text-cream hover:bg-leaf disabled:opacity-60">
              {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Sign in
            </button>
            <p className="text-center text-xs text-bark/50">Default credentials are created automatically on first use.</p>
          </form>
        )}
      </Modal>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'products', label: 'Products', icon: LayoutGrid },
    { id: 'text', label: 'Storefront Text', icon: Type },
    { id: 'contacts', label: 'Contacts', icon: Share2 },
    { id: 'security', label: 'Security', icon: KeyRound },
  ];

  return (
    <Modal open={open} onClose={onClose} wide title={title}>
      <div className="flex flex-col md:flex-row">
        <aside className="flex gap-1 overflow-x-auto border-b border-forest/10 p-3 md:w-56 md:flex-col md:border-b-0 md:border-r">
          {tabs.map(({ id, label: l, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition ${tab === id ? 'bg-forest text-cream' : 'text-forest hover:bg-forest/5'}`}>
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-chili hover:bg-chili/10 md:mt-auto">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <div className="min-h-[420px] flex-1 p-5 sm:p-6">
          {syncMsg && (
            <p className={`mb-4 rounded-xl px-3 py-2 text-sm ${sync === 'error' ? 'bg-chili/10 text-chili' : 'bg-lime/10 text-leaf'}`}>{syncMsg}</p>
          )}

          {tab === 'products' && (
            <div className="space-y-4">
              {editing ? (
                <ProductForm
                  key={editing === 'new' ? 'new' : editing.id}
                  initial={editing === 'new' ? null : editing}
                  saving={sync === 'saving'}
                  onCancel={() => setEditing(null)}
                  onSave={saveProduct}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-bark/60">{products.length} products in catalogue</p>
                    <button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-leaf">
                      <Plus className="h-4 w-4" /> Add product
                    </button>
                  </div>
                  <div className="divide-y divide-forest/10 overflow-hidden rounded-2xl border border-forest/10 bg-white/70">
                    {products.length === 0 && <p className="p-6 text-center text-sm text-bark/60">No products yet.</p>}
                    {products.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3">
                        {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-parchment" />}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-forest">
                            {p.name}{' '}
                            {!p.in_stock && <span className="ml-1 rounded bg-chili/10 px-1.5 text-[10px] font-bold uppercase text-chili">Sold out</span>}
                          </p>
                          <p className="truncate text-xs text-bark/60">{(p.weights || []).map((w) => `${w.label} · ${inr(w.price)}`).join('  |  ')}</p>
                        </div>
                        {confirmDel === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => removeProduct(p.id)} className="rounded-full bg-chili px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                            <button onClick={() => setConfirmDel(null)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-bark/70 hover:bg-forest/5">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditing(p)} aria-label="Edit" className="grid h-9 w-9 place-items-center rounded-full text-forest hover:bg-forest/10"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setConfirmDel(p.id)} aria-label="Delete" className="grid h-9 w-9 place-items-center rounded-full text-chili hover:bg-chili/10"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className={label}>Announcement bar</label>
                <input className={input} value={draft.announcement ?? ''} onChange={(e) => setDraft({ ...draft, announcement: e.target.value })} />
              </div>
              <div>
                <label className={label}>Hero eyebrow</label>
                <input className={input} value={draft.hero_eyebrow ?? ''} onChange={(e) => setDraft({ ...draft, hero_eyebrow: e.target.value })} />
              </div>
              <div>
                <label className={label}>Hero headline (last word is highlighted)</label>
                <input className={input} value={draft.hero_headline ?? ''} onChange={(e) => setDraft({ ...draft, hero_headline: e.target.value })} />
              </div>
              <div>
                <label className={label}>Hero introduction</label>
                <textarea className={`${input} min-h-[110px]`} value={draft.hero_intro ?? ''} onChange={(e) => setDraft({ ...draft, hero_intro: e.target.value })} />
              </div>
              <div>
                <label className={label}>Footer note</label>
                <textarea className={`${input} min-h-[70px]`} value={draft.footer_note ?? ''} onChange={(e) => setDraft({ ...draft, footer_note: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <button disabled={sync === 'saving'} onClick={() => saveSettings(['announcement', 'hero_eyebrow', 'hero_headline', 'hero_intro', 'footer_note'])} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-leaf disabled:opacity-60">
                  <Save className="h-4 w-4" /> Publish text
                </button>
              </div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-4">
              <div>
                <label className={label}>WhatsApp number (with country code, digits only)</label>
                <input className={input} placeholder="919876543210" value={draft.whatsapp_number ?? ''} onChange={(e) => setDraft({ ...draft, whatsapp_number: e.target.value })} />
                <p className="mt-1 text-xs text-bark/50">Orders open wa.me/{(draft.whatsapp_number || '').replace(/\D/g, '') || '…'}</p>
              </div>
              <div>
                <label className={label}>Instagram handle</label>
                <input className={input} placeholder="pathaayam.spices" value={draft.instagram_handle ?? ''} onChange={(e) => setDraft({ ...draft, instagram_handle: e.target.value })} />
              </div>
              <div>
                <label className={label}>Contact email</label>
                <input className={input} type="email" value={draft.contact_email ?? ''} onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <button disabled={sync === 'saving'} onClick={() => saveSettings(['whatsapp_number', 'instagram_handle', 'contact_email'])} className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-leaf disabled:opacity-60">
                  <Save className="h-4 w-4" /> Save contacts
                </button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <form onSubmit={changeCreds} className="max-w-md space-y-4">
              <p className="text-sm text-bark/70">Change the admin username or password. You'll stay signed in on this device.</p>
              <div>
                <label className={label}>Current password *</label>
                <input className={input} type="password" value={sec.current} onChange={(e) => setSec({ ...sec, current: e.target.value })} />
              </div>
              <div>
                <label className={label}>Username</label>
                <input className={input} value={sec.newUser} onChange={(e) => setSec({ ...sec, newUser: e.target.value })} />
              </div>
              <div>
                <label className={label}>New password (leave blank to keep)</label>
                <input className={input} type="password" value={sec.newPass} onChange={(e) => setSec({ ...sec, newPass: e.target.value })} />
              </div>
              <div>
                <label className={label}>Confirm new password</label>
                <input className={input} type="password" value={sec.confirm} onChange={(e) => setSec({ ...sec, confirm: e.target.value })} />
              </div>
              {secErr && <p className="rounded-xl bg-chili/10 px-3 py-2 text-sm text-chili">{secErr}</p>}
              {secOk && <p className="rounded-xl bg-lime/10 px-3 py-2 text-sm text-leaf">{secOk}</p>}
              <button className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-leaf">
                <KeyRound className="h-4 w-4" /> Update credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
