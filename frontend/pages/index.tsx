// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout'; // ตรวจสอบ path ให้ตรงกับโฟลเดอร์ของคุณ
import { useEffect } from 'react';

export default function Home() {
  // ฟังก์ชันรันแอนิเมชันตัวเลข แปลงจาก vanilla JS มาไว้ใน useEffect เพื่อให้รันตอนโหลดหน้าเสร็จ
  useEffect(() => {
    const animateCounter = (el: HTMLElement | null, target: number, duration: number = 1200, suffix: string = '') => {
      if (!el) return;
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = Math.floor(start) + suffix;
        if (start >= target) clearInterval(timer);
      }, 16);
    };

    const timeout = setTimeout(() => {
      animateCounter(document.getElementById('stat-prod'), 24);
      animateCounter(document.getElementById('stat-breeds'), 20);
      animateCounter(document.getElementById('stat-acc'), 82, 1400, '%');
    }, 600);

    return () => clearTimeout(timeout); // Cleanup ป้องกัน memory leak
  }, []);

  return (
    <Layout>
      <Head>
        <title>PetNutrition AI — Personalized Nutrition for Your Pet</title>
        <meta
          name="description"
          content="AI-powered pet food recommendations personalized to your pet's breed, age, weight, and health conditions. Get started in 60 seconds."
        />
      </Head>

      {/* Hero Section */}
      <section className="hero">
        <div className="floating-pets">
          <div className="fp" style={{ left: '8%', top: '20%', animationDuration: '12s', fontSize: '40px', opacity: 0.12 }}>🐶</div>
          <div className="fp" style={{ left: '15%', top: '70%', animationDuration: '10s', fontSize: '40px', opacity: 0.12 }}>🦴</div>
          <div className="fp" style={{ left: '80%', top: '65%', animationDuration: '13s', fontSize: '40px', opacity: 0.12 }}>🐟</div>
          <div className="fp" style={{ left: '50%', top: '10%', animationDuration: '11s', fontSize: '40px', opacity: 0.12 }}>⭐</div>
        </div>
        <div className="hero-content fade-in">
          <div className="hero-logo" style={{ fontSize: '120px', marginBottom: '20px' }}>🐾</div>
          <h1 className="hero-title">
            <span className="g1">Pet Lifestyle</span><br />
            &amp; <span className="g2">Nutrition</span> Recommender
          </h1>
          <p className="hero-subtitle">
            Personalized nutrition for your pet — tailored to breed, age, and health conditions.
          </p>
          <div className="hero-btns">
            <Link href="/profile" className="btn btn-primary btn-lg">
              <span className="emoji">🐶</span> Start Recommendation
            </Link>
            <a href="#how" className="btn btn-ghost btn-lg">🏪 For Pet Shops</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-val" id="stat-prod">0</div>
              <div className="hero-stat-lbl">Products</div>
            </div>
            <div>
              <div className="hero-stat-val" id="stat-breeds">0</div>
              <div className="hero-stat-lbl">Breeds</div>
            </div>
            <div>
              <div className="hero-stat-val" id="stat-acc">0%</div>
              <div className="hero-stat-lbl">Precision@5</div>
            </div>
            <div>
              <div className="hero-stat-val" id="stat-time">0s</div>
              <div className="hero-stat-lbl">Avg Response</div>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-line"></div>

      {/* Features Section */}
      <section className="features" id="how">
        <div className="container">
          <h2 className="features-title">🧠 How It Works</h2>
          <p className="features-sub">Three simple steps to perfect nutrition</p>
          
          <div className="how-grid">
            <div className="how-card fade-in">
              <div className="how-num">1</div>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>📋</div>
              <h3>Fill Pet Profile</h3>
              <p>Tell us your pet&apos;s species, breed, age, weight, and any health conditions.</p>
            </div>
            <div className="how-card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="how-num">2</div>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>🤖</div>
              <h3>AI Analyzes</h3>
              <p>Our ML model scores all available products against your pet&apos;s specific needs.</p>
            </div>
            <div className="how-card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="how-num">3</div>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>🥇</div>
              <h3>Get Top 5 Picks</h3>
              <p>Receive ranked recommendations with relevance scores and vet-approved reasons.</p>
            </div>
            <div className="how-card fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="how-num">4</div>
              <div style={{ fontSize: '36px', marginBottom: '14px' }}>🔄</div>
              <h3>Adaptive Learning</h3>
              <p>Your clicks improve future recommendations — the model learns your preferences!</p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="features-grid" style={{ marginBottom: '80px' }}>
            <div className="feature-card fade-in">
              <div className="feature-emoji">🏥</div>
              <h3>Health-Condition Aware</h3>
              <p>Supports Kidney Disease, Obesity, Food Allergies, and Digestive disorders with vetted clinical formulas.</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="feature-emoji">⚖️</div>
              <h3>Weight Management</h3>
              <p>High-fiber, low-calorie formulas to help overweight pets reach their ideal body condition score.</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-emoji">🧬</div>
              <h3>Breed-Specific Nutrition</h3>
              <p>Some breeds have predispositions to certain conditions — our model accounts for breed-specific risk factors.</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="feature-emoji">🔄</div>
              <h3>Adaptive Recommendations</h3>
              <p>Click &quot;Interested&quot; on products and watch your recommendations update in real-time based on your preferences.</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="feature-emoji">📊</div>
              <h3>Relevance Scoring</h3>
              <p>Each product gets a 0–100 relevance score with a clear explanation of why it&apos;s recommended for your pet.</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="feature-emoji">🛡️</div>
              <h3>Vet-Grade Products</h3>
              <p>All 20 products in our catalog are from trusted brands: Royal Canin, Hill&apos;s, Purina, Orijen, and Acana.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <h2>Ready to find the perfect food? 🐾</h2>
            <p>Takes less than 60 seconds. No account required.</p>
            <Link href="/profile" className="btn btn-orange btn-lg">
              <span className="emoji">🐶</span> Start for Free
            </Link>
          </div>
        </div>
      </section>

      {/* สไตล์เฉพาะหน้านี้ (CSS-in-JS ของ Next.js) */}
      <style jsx>{`
        .how-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          padding: 0 0 80px;
        }

        .how-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          text-align: center;
          transition: var(--t-slow);
        }

        .how-card:hover {
          transform: translateY(-4px);
          border-color: rgba(123, 111, 240, 0.4);
        }

        .how-num {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--orange));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 900;
          color: white;
          margin: 0 auto 14px;
        }

        .how-card h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .how-card p {
          font-size: 13px;
          color: var(--text-2);
        }

        .cta-section {
          background: linear-gradient(135deg, rgba(123, 111, 240, 0.1), rgba(253, 150, 68, 0.08));
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 60px 40px;
          text-align: center;
          margin: 0 0 80px;
        }

        .cta-section h2 {
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .cta-section p {
          font-size: 17px;
          color: var(--text-2);
          margin-bottom: 32px;
        }

        .floating-pets {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .fp {
          position: absolute;
          font-size: 28px;
          opacity: 0.08;
          animation: fp-spin linear infinite;
        }

        @keyframes fp-spin {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
          to { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </Layout>
  );
}