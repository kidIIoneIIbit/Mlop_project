// pages/compare.tsx
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { postCompare, CompareItem } from '@/lib/api';
import Link from 'next/link';

export default function Compare() {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [winner, setWinner] = useState<CompareItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('petProfile');
    const savedLog = localStorage.getItem('clickLog');

    if (!savedProfile || !savedLog) {
      setError('No profile or liked products found. Go back and like some recommendations first.');
      setLoading(false);
      return;
    }

    const profile = JSON.parse(savedProfile);
    const log = JSON.parse(savedLog) as { productId: string }[];
    const foodIds = log.map((l) => l.productId);

    if (foodIds.length < 2) {
      // Fall back to using stored recommendation food IDs if not enough likes
      const savedRecs = localStorage.getItem('recommendations');
      if (savedRecs) {
        const recs = JSON.parse(savedRecs).recommendations ?? [];
        const topIds = recs.slice(0, 3).map((r: any) => r.food_id);
        foodIds.push(...topIds);
      }
    }

    const uniqueIds = [...new Set(foodIds)];
    if (uniqueIds.length === 0) {
      setError('No food items to compare.');
      setLoading(false);
      return;
    }

    postCompare({
      food_ids: uniqueIds,
      species: profile.species,
      breed_id: profile.breed_id,
      age_years: profile.age_years ?? 3,
      activity_level: profile.activity_level ?? 'medium',
      health_conditions: profile.health_conditions ?? [],
    })
      .then((res) => {
        setItems(res.data.comparison);
        setWinner(res.data.winner);
      })
      .catch(() => setError('Failed to load comparison. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Head><title>Compare Foods — PetNutrition AI</title></Head>
      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>⚖️ Food Comparator</h1>
            <p style={{ color: 'var(--text-2)' }}>Side-by-side nutritional breakdown for your top matches.</p>
          </div>

          {loading && <p style={{ textAlign: 'center', color: 'var(--text-3)' }}>Loading comparison...</p>}

          {error && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#e74c3c', marginBottom: '16px' }}>⚠️ {error}</p>
              <Link href="/results/1" className="btn btn-primary">← Back to Results</Link>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              {winner && (
                <div style={{ textAlign: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(0,201,167,0.1)', borderRadius: '12px', border: '1px solid var(--teal)' }}>
                  🏆 <strong>Winner:</strong> {winner.name} ({winner.brand}) — Score: {Math.round(winner.score)}/100
                </div>
              )}

              <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(123, 111, 240, 0.1)' }}>
                      <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', width: '20%' }}>Features</th>
                      {items.map(item => (
                        <th key={item.food_id} style={{ padding: '20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px' }}>{item.brand}</div>
                          <div style={{ fontSize: '16px', fontWeight: 800 }}>{item.name}</div>
                          {winner && item.food_id === winner.food_id && (
                            <div style={{ marginTop: '8px', fontSize: '11px', display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>🏆 Winner</div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Match Score</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 700, color: 'var(--teal)' }}>
                          {Math.round(item.score)}/100
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Price (USD)</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>${item.price_usd?.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Protein</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>{item.nutritional_content?.protein ?? '-'}%</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Fat</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>{item.nutritional_content?.fat ?? '-'}%</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Fiber</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>{item.nutritional_content?.fiber ?? '-'}%</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Calories (kcal/100g)</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>{item.nutritional_content?.kcal_per_100g ?? '-'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>Rating</td>
                      {items.map(item => (
                        <td key={item.food_id} style={{ padding: '16px 20px', textAlign: 'center' }}>★ {item.avg_rating?.toFixed(1)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}