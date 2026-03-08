// pages/results/[petId].tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout'; // ตรวจสอบ path ให้ตรงกับโปรเจกต์คุณ

// Mock ข้อมูลสินค้า (จำลองจาก pet-data.js)
const MOCK_PRODUCTS = [
  { id: 'P001', name: 'Royal Canin Renal Support', brand: 'Royal Canin', emoji: '🐕', price: 890, unit: '3kg', tags: ['kidney', 'senior'], diseaseSupport: ['Kidney Care'], score: 95, reason: 'Matched clinical needs for Kidney Disease. Low phosphorus.' },
  { id: 'P002', name: 'Hill\'s Science Diet Perfect Weight', brand: 'Hill\'s', emoji: '🦴', price: 750, unit: '2.5kg', tags: ['weight control', 'adult'], diseaseSupport: ['Obesity'], score: 88, reason: 'High fiber, clinically proven for weight management.' },
  { id: 'P003', name: 'Purina Pro Plan Sensitive Skin', brand: 'Purina', emoji: '🐟', price: 620, unit: '2kg', tags: ['salmon', 'sensitive'], diseaseSupport: ['Food Allergies'], score: 82, reason: 'Contains omega fatty acids to support coat & skin.' },
];

const SCORE_COLORS = [
  'linear-gradient(90deg,#fdcb6e,#e17055)',
  'linear-gradient(90deg,#b2bec3,#636e72)',
  'linear-gradient(90deg,#fd9644,#c67a30)'
];

export default function Recommendations() {
  const router = useRouter();
  const { petId } = router.query; // รับค่า ID จาก URL เช่น /results/1

  // สร้าง States
  const [profile, setProfile] = useState<any>(null);
  const [clickLog, setClickLog] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);
  const [mounted, setMounted] = useState(false);

  // โหลดข้อมูลจาก LocalStorage ตอนเปิดหน้าเว็บ
  useEffect(() => {
    const savedProfile = localStorage.getItem('petProfile');
    const savedLog = localStorage.getItem('clickLog');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedLog) {
      const parsedLog = JSON.parse(savedLog);
      setClickLog(parsedLog);
      setLikedIds(parsedLog.map((log: any) => log.productId));
    }
    
    setMounted(true); // ป้องกัน Hydration Error

    // แอนิเมชันหลอดคะแนน
    const timer = setTimeout(() => setAnimateBars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // ฟังก์ชันกดหัวใจ (Mark Interested)
  const handleLike = (productId: string, productName: string) => {
    if (likedIds.includes(productId)) return;

    const newLikedIds = [...likedIds, productId];
    const newLog = [...clickLog, { productId, productName, timestamp: new Date().toISOString() }];
    
    setLikedIds(newLikedIds);
    setClickLog(newLog);
    localStorage.setItem('clickLog', JSON.stringify(newLog));

    alert(`❤️ Saved! ${productName} added to your interests.`); // แทน showToast ชั่วคราว
  };

  // ฟังก์ชันล้างประวัติการคลิก
  const clearInterests = () => {
    setLikedIds([]);
    setClickLog([]);
    localStorage.removeItem('clickLog');
    alert('💡 Interest log reset. Recommendations refreshed.');
  };

  // ฟังก์ชัน Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('✅ Recommendations updated!');
    }, 600);
  };

  // เลี่ยงปัญหาจอกะพริบตอนโหลดข้อมูลจาก localStorage (Hydration)
  if (!mounted) return null;

  return (
    <Layout>
      <Head>
        <title>Recommendations — PetNutrition AI</title>
      </Head>

      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container">
          
          {/* กรณีไม่มี Profile ให้แสดง Empty State */}
          {!profile ? (
            <div className="adaptive-banner" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="banner-icon">⚠️</div>
              <div className="banner-text">
                <strong>No pet profile found</strong>
                <p>Please create a profile first to get recommendations.</p>
              </div>
              <Link href="/profile" className="btn btn-primary">Create Profile →</Link>
            </div>
          ) : (
            <>
              {/* Header โชว์ข้อมูลสัตว์เลี้ยง */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div style={{ fontSize: '48px' }}>{profile.species === 'dog' ? '🐕' : '🐱'}</div>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '4px' }}>
                    Top Picks for <span style={{ background: 'linear-gradient(135deg,var(--accent-light),var(--orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{profile.name}</span> 🐾
                  </h1>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className="badge badge-purple">{profile.breed}</span>
                    <span className="badge badge-orange">{profile.age} yrs</span>
                    <span className="badge badge-teal">{profile.weight} kg</span>
                    {profile.conditions?.map((c: string) => (
                      <span key={c} className="badge badge-pink">🏥 {c}</span>
                    ))}
                    {profile.goals?.map((g: string) => (
                      <span key={g} className="badge badge-yellow">🎯 {g}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adaptive Banner (โชว์เมื่อเคยกดไลก์ ≥ 2 ครั้ง) */}
              {clickLog.length >= 2 && (
                <div className="adaptive-banner" style={{ marginBottom: '20px' }}>
                  <div className="banner-icon">🔄</div>
                  <div className="banner-text">
                    <strong>Recommendations updated based on your interests!</strong>
                    <p>You&apos;ve expressed interest in {clickLog.length} product(s). Your recommendations now reflect your preferences.</p>
                  </div>
                  <span className="badge badge-teal">Adaptive · V2</span>
                </div>
              )}

              {/* Model Info Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-purple">🤖 Model v{clickLog.length >= 2 ? '2' : '1'}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Ranked by relevance score</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
                  </button>
                  <Link href="/profile" className="btn btn-ghost btn-sm">✏️ Edit Profile</Link>
                </div>
              </div>

              {/* Recommendation Grid */}
              <div className="rec-grid">
                {MOCK_PRODUCTS.map((p, i) => {
                  const rankNum = i + 1;
                  const isLiked = likedIds.includes(p.id);
                  
                  return (
                    <div key={p.id} className="rec-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className={`rank-badge rank-${rankNum}`}>{rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : rankNum}</div>
                      <div className="product-img" style={{ fontSize: '72px' }}>{p.emoji}</div>
                      
                      <div className="card-body">
                        <div className="product-brand">{p.brand}</div>
                        <div className="product-name">{p.name}</div>
                        
                        <div className="score-wrap">
                          <div className="score-header">
                            <span className="score-label">Relevance Score</span>
                            <span className="score-val">{p.score}/100</span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill" style={{ background: SCORE_COLORS[i % SCORE_COLORS.length], width: animateBars ? `${p.score}%` : '0%' }}></div>
                          </div>
                        </div>
                        
                        <div className="rec-reason"><span className="reason-icon">💡</span>{p.reason}</div>
                        
                        <div className="rec-tags">
                          {p.diseaseSupport.map(d => <span key={d} className="rec-tag rec-tag-teal">{d}</span>)}
                          {p.tags.map(t => <span key={t} className="rec-tag rec-tag-purple">{t}</span>)}
                          <span className="rec-tag rec-tag-orange">฿{p.price.toLocaleString()} / {p.unit}</span>
                        </div>
                        
                        <div className="card-actions">
                          <button className={`btn btn-like ${isLiked ? 'liked' : ''}`} onClick={() => handleLike(p.id, p.name)}>
                            {isLiked ? '❤️ Interested' : '🤍 Interested'}
                          </button>
                          <Link href={`/product/${p.id}`} className="btn btn-outline">
                            🔍 View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interest Log */}
              {clickLog.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <div className="divider"></div>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>YOUR INTEREST LOG</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                      {clickLog.map((log, idx) => (
                        <span key={idx} className="badge badge-purple">🐾 {log.productName}</span>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: '14px' }} onClick={clearInterests}>Clear My Interests</button>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </Layout>
  );
}