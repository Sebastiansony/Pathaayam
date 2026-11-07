import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import Story from './components/Story';
import Footer from './components/Footer';
import BuyModal, { type BuyItem } from './components/BuyModal';
import AdminModal from './components/admin/AdminModal';
import { api, type Product, type Settings } from './lib/api';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buy, setBuy] = useState<BuyItem>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.getProducts(), api.getSettings()]);
      setProducts(p);
      setSettings(s);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll().catch(() => {});
    // Keep the storefront in sync with admin edits made from other devices.
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') fetchAll().catch(() => {});
    }, 30000);
    if (window.location.hash === '#admin') setAdminOpen(true);
    return () => clearInterval(t);
  }, [fetchAll]);


  return (
    <div className="min-h-screen">
      <Header announcement={settings.announcement} onAdmin={() => setAdminOpen(true)} />
      <main>
        <Hero settings={settings} productCount={products.filter((p) => p.in_stock).length} />
        <Catalog
          products={products}
          loading={loading}
          error={error}
          onRetry={() => { setLoading(true); fetchAll().catch(() => {}); }}
          onBuy={(product, weight, qty) => setBuy({ product, weight, qty })}
        />
        <Story settings={settings} />
      </main>
      <Footer settings={settings} onAdmin={() => setAdminOpen(true)} />

      <BuyModal item={buy} settings={settings} onClose={() => setBuy(null)} />
      <AdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        settings={settings}
        onRefresh={fetchAll}
      />
    </div>
  );
}
