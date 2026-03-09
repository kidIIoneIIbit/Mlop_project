// pages/product/[id].tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getFoodDetail, type FoodDetail } from '@/lib/api';

const FOOD_EMOJI_POOL: Record<string, string[]> = {
  dog_dry:          ['🦴', '🍪', '🥨'],
  dog_wet:          ['🥫', '🍲', '🥘'],
  dog_raw:          ['🥩', '🥓', '🍗'],
  dog_freeze_dried: ['🧊', '🌨️', '🏔️'],
  dog_treats:       ['🍖', '🐶', '🎁'],
  cat_dry:          ['🐟', '🐠', '🦈'],
  cat_wet:          ['🥣', '🍛', '🍜'],
  cat_raw:          ['🐾', '🦞', '🦀'],
  cat_freeze_dried: ['❄️', '⛄', '🌬️'],
  cat_treats:       ['🐡', '🦐', '🍤'],
};

function foodEmoji(food: FoodDetail): string {
  const sp   = food.species?.toLowerCase() === 'cat' ? 'cat' : 'dog';
  const key  = `${sp}_${food.food_type?.toLowerCase()}`;
  const pool = FOOD_EMOJI_POOL[key];
  if (!pool) return sp === 'cat' ? '🐱' : '🐕';
  // Use brand char-sum to pick a stable emoji from the pool
  const idx = food.brand
    ? food.brand.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % pool.length
    : 0;
  return pool[idx];
}

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [food, setFood]       = useState<FoodDetail | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;

    setLoading(true);
    setError(null);

    getFoodDetail(id)
      .then((data) => {
        setFood(data);
        // Check if already in interest log
        const logs = JSON.parse(localStorage.getItem('clickLog') || '[]');
        if (logs.some((l: { productId: string }) => l.productId === data.id)) {
          setIsLiked(true);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = () => {
    if (!food || isLiked) return;
    const logs = JSON.parse(localStorage.getItem('clickLog') || '[]');
    const newLogs = [...logs, { productId: food.id, productName: food.name, timestamp: new Date().toISOString() }];
    localStorage.setItem('clickLog', JSON.stringify(newLogs));
    setIsLiked(true);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-3)' }}>
          Loading product…
        </div>
      </Layout>
    );
  }

  if (error || !food) {
    return (
      <Layout>
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
            {error ?? 'Product not found.'}
          </p>
          <Link href="/results/1" className="btn btn-primary">← Back to Recommendations</Link>
        </div>
      </Layout>
    );
  }

  const { protein, fat, fiber, kcal_per_100g } = food.nutritional_content;

  return (
    <Layout>
      <Head><title>{food.name} — PetNutrition AI</title></Head>

      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container-sm" style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Back link */}
          <div style={{ marginBottom: '24px' }}>
            <Link href="/results/1" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-3)', fontWeight: 700 }}>
              ← Back to Recommendations
            </Link>
          </div>

          {/* Hero card */}
          <div className="card fade-in" style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '32px', padding: '32px', alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(123,111,240,0.05), rgba(0,201,167,0.05))' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px', flexShrink: 0 }}>
                {foodEmoji(food)}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  {food.brand}
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.3 }}>
                  {food.name}
                </h1>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '4px' }}>PRICE</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>${food.price_usd.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '4px' }}>TYPE</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, textTransform: 'capitalize' }}>{food.food_type}</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '4px' }}>RATING</div>
                    <div style={{ fontSize: '16px', fontWeight: 800 }}>⭐ {food.avg_rating.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition facts */}
          <div className="card fade-in" style={{ marginBottom: '24px', padding: '28px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Nutritional Content</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Protein', value: `${protein}%`, color: 'var(--teal)' },
                { label: 'Fat',     value: `${fat}%`,     color: 'var(--orange)' },
                { label: 'Fiber',   value: `${fiber}%`,   color: 'var(--accent)' },
                ...(kcal_per_100g ? [{ label: 'Calories', value: `${kcal_per_100g} kcal/100g`, color: 'var(--text-2)' }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px' }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags & badges */}
          <div className="card fade-in" style={{ marginBottom: '24px', padding: '28px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px' }}>Tags &amp; Certifications</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {food.badges.map((b) => <span key={b} className="rec-tag rec-tag-teal">{b}</span>)}
              {food.tags.map((t) => <span key={t} className="rec-tag rec-tag-purple">{t}</span>)}
              {food.certifications.map((c) => <span key={c} className="rec-tag rec-tag-orange">{c}</span>)}
              <span className="rec-tag rec-tag-purple" style={{ textTransform: 'capitalize' }}>{food.species}</span>
            </div>
          </div>

          {/* Action */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <button
              className={`btn ${isLiked ? 'liked' : 'btn-orange'} btn-lg`}
              onClick={handleLike}
              disabled={isLiked}
              style={{ minWidth: '200px', justifyContent: 'center' }}
            >
              {isLiked ? '❤️ Interested' : '🤍 Mark as Interested'}
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}