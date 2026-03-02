// pages/product/[id].tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

// Mock ข้อมูลสินค้า (เพื่อให้สอดคล้องกับหน้าเว็บ)
const MOCK_DB: Record<string, any> = {
  'P001': { id: 'P001', name: 'Royal Canin Renal Support', brand: 'Royal Canin', emoji: '🐕', price: 890, unit: '3kg', tags: ['kidney', 'senior', 'low phosphorus'], desc: 'Formulated to support adult dogs with chronic kidney disease. Features low phosphorus and highly digestible protein to reduce kidney workload.' },
  'P002': { id: 'P002', name: 'Hill\'s Science Diet Perfect Weight', brand: 'Hill\'s', emoji: '🦴', price: 750, unit: '2.5kg', tags: ['weight control', 'adult', 'high fiber'], desc: 'Clinically proven nutrition to help dogs achieve a healthy weight in 10 weeks. High protein, high fiber formula enriched with L-carnitine.' },
  'P003': { id: 'P003', name: 'Purina Pro Plan Sensitive Skin', brand: 'Purina', emoji: '🐟', price: 620, unit: '2kg', tags: ['salmon', 'sensitive', 'omega-3'], desc: 'Formulated with real salmon and rich in omega fatty acids to nourish sensitive skin and promote a healthy, shiny coat.' }
};

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const product = typeof id === 'string' ? MOCK_DB[id] : null;

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (product) {
      const logs = JSON.parse(localStorage.getItem('clickLog') || '[]');
      if (logs.some((log: any) => log.productId === product.id)) {
        setIsLiked(true);
      }
    }
  }, [product]);

  const handleLike = () => {
    if (!product || isLiked) return;
    const logs = JSON.parse(localStorage.getItem('clickLog') || '[]');
    const newLogs = [...logs, { productId: product.id, productName: product.name, timestamp: new Date().toISOString() }];
    localStorage.setItem('clickLog', JSON.stringify(newLogs));
    setIsLiked(true);
    alert('❤️ Saved! Added to your interests.');
  };

  if (!product) return <Layout><div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div></Layout>;

  return (
    <Layout>
      <Head><title>{product.name} — PetNutrition AI</title></Head>
      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container-sm">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/results/1" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-3)', fontWeight: 700 }}>
              ← Back to Recommendations
            </Link>
          </div>

          <div className="card fade-in" style={{ marginBottom: '28px', padding: '0', overflow: 'hidden' }}>
            <div className="product-hero" style={{ display: 'flex', gap: '32px', padding: '32px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(123, 111, 240, 0.05), rgba(0, 201, 167, 0.05))' }}>
              <div className="product-hero-img" style={{ width: '160px', height: '160px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', flexShrink: 0 }}>
                {product.emoji}
              </div>
              <div>
                <div style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{product.brand}</div>
                <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.2 }}>{product.name}</h1>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>PRICE</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>฿{product.price}</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '4px' }}>PACKAGE</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{product.unit}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card fade-in" style={{ marginBottom: '28px', padding: '28px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-1)' }}>📄 About This Product</div>
            <div style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.8 }}>{product.desc}</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
            {product.tags.map((t: string) => (
              <span key={t} className="rec-tag rec-tag-purple">{t}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <button className={`btn ${isLiked ? 'liked' : 'btn-orange'} btn-lg`} onClick={handleLike} disabled={isLiked} style={{ minWidth: '200px', justifyContent: 'center' }}>
              {isLiked ? '❤️ Interested' : '🤍 Mark as Interested'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}