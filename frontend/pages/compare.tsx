// pages/compare.tsx
import Head from 'next/head';
import Layout from '@/components/Layout';

// Mock Data สำหรับตารางเปรียบเทียบ
const COMPARE_DATA = [
  { id: 'P001', name: 'Renal Support', brand: 'Royal Canin', price: 890, protein: '12%', fat: '18%', fiber: '4%', kcal: 3900, highlight: 'Best for Kidney' },
  { id: 'P002', name: 'Perfect Weight', brand: 'Hill\'s', price: 750, protein: '28%', fat: '11%', fiber: '10%', kcal: 3200, highlight: 'Best for Diet' },
  { id: 'P003', name: 'Sensitive Skin', brand: 'Purina', price: 620, protein: '26%', fat: '16%', fiber: '4%', kcal: 3700, highlight: 'Best Value' },
];

export default function Compare() {
  return (
    <Layout>
      <Head><title>Compare Foods — PetNutrition AI</title></Head>
      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>⚖️ Food Comparator</h1>
            <p style={{ color: 'var(--text-2)' }}>Side-by-side nutritional breakdown for your top matches.</p>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(123, 111, 240, 0.1)' }}>
                  <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', width: '25%' }}>Features</th>
                  {COMPARE_DATA.map(item => (
                    <th key={item.id} style={{ padding: '20px', borderBottom: '1px solid var(--border)', width: '25%', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px' }}>{item.brand}</div>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>{item.name}</div>
                      <div style={{ marginTop: '8px', fontSize: '11px', display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>{item.highlight}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Price (THB)', key: 'price', best: 620 },
                  { label: 'Protein (Min)', key: 'protein', best: '28%' },
                  { label: 'Fat (Min)', key: 'fat', best: '11%' },
                  { label: 'Fiber (Max)', key: 'fiber', best: '10%' },
                  { label: 'Calories (kcal/kg)', key: 'kcal', best: 3200 }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-2)' }}>{row.label}</td>
                    {COMPARE_DATA.map(item => (
                      <td key={item.id} style={{ padding: '16px 20px', textAlign: 'center', color: (item as any)[row.key] === row.best ? 'var(--teal)' : 'var(--text-1)', fontWeight: (item as any)[row.key] === row.best ? 800 : 400 }}>
                        {(item as any)[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Layout>
  );
}