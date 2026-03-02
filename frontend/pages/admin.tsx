// pages/admin.tsx
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    if (!chartLoaded || !(window as any).Chart) return;

    const ctx = (document.getElementById('precChart') as HTMLCanvasElement).getContext('2d');
    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: ['@1', '@2', '@3', '@4', '@5', '@6', '@7', '@8', '@9', '@10'],
        datasets: [
          { label: 'V1 (Rule-based)', data: [0.90, 0.87, 0.84, 0.83, 0.82, 0.80, 0.78, 0.77, 0.76, 0.76], borderColor: 'rgba(0,201,167,0.9)', backgroundColor: 'rgba(0,201,167,0.08)', tension: 0.4, fill: true, pointRadius: 3 },
          { label: 'V2 (Adaptive LightFM)', data: [0.94, 0.91, 0.89, 0.87, 0.86, 0.84, 0.83, 0.82, 0.80, 0.79], borderColor: 'rgba(123,111,240,0.9)', backgroundColor: 'rgba(123,111,240,0.08)', tension: 0.4, fill: true, pointRadius: 3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#eeeaf8', font: { family: 'Nunito' } } } },
        scales: {
          y: { min: 0.7, max: 1.0, grid: { color: 'rgba(123,111,240,0.08)' }, ticks: { color: '#9590b8' } },
          x: { grid: { display: false }, ticks: { color: '#9590b8' } }
        }
      }
    });
  }, [chartLoaded]);

  return (
    <>
      <Head><title>Admin Dashboard — PetNutrition AI</title></Head>
      {/* โหลด Chart.js ผ่าน CDN แบบเดียวกับ HTML */}
      <Script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" onLoad={() => setChartLoaded(true)} />
      
      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-icon">🐾</div>
          <div className="brand-text">
            <div className="name">PetNutrition AI</div>
            <div className="sub">Admin View</div>
          </div>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">← Back to App</Link>
        </nav>
        <div style={{ background: 'rgba(253, 121, 168, 0.1)', color: 'var(--pink)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, border: '1px solid rgba(253, 121, 168, 0.3)' }}>
          🔒 Admin / Demo Only
        </div>
      </header>

      <div style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>🔬 MLOps Demo Dashboard</h1>
            <p style={{ color: 'var(--text-3)' }}>Real-time evaluation metrics for LightFM recommendation engine.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Stat Cards */}
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Current Model</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>LightFM-WARP v2</div>
            </div>
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Precision@5</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--teal)' }}>86.2%</div>
            </div>
            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Total Interactions</div>
              <div style={{ fontSize: '24px', fontWeight: 900 }}>12,450</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', height: '400px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>📈 Precision@K Comparison (V1 vs V2)</div>
            <div style={{ position: 'relative', height: '300px' }}>
              <canvas id="precChart"></canvas>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}