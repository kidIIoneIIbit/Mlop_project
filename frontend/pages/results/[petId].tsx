// pages/results/[petId].tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { type RecommendationResponse, type RecommendationItem } from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SCORE_COLORS = [
  'linear-gradient(90deg,#fdcb6e,#e17055)',
  'linear-gradient(90deg,#74b9ff,#0984e3)',
  'linear-gradient(90deg,#55efc4,#00b894)',
  'linear-gradient(90deg,#fd9644,#c67a30)',
  'linear-gradient(90deg,#a29bfe,#6c5ce7)',
  'linear-gradient(90deg,#b2bec3,#636e72)',
];

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

function buildEmojiMap(items: RecommendationItem[]): Map<string, string> {
  const map: Map<string, string> = new Map();
  const counter: Record<string, number> = {};
  items.forEach((item) => {
    const sp  = item.species?.toLowerCase() === 'cat' ? 'cat' : 'dog';
    const key = `${sp}_${item.food_type?.toLowerCase()}`;
    const idx = counter[key] ?? 0;
    counter[key] = idx + 1;
    const pool = FOOD_EMOJI_POOL[key] ?? [sp === 'cat' ? '🐱' : '🐕'];
    map.set(item.food_id, pool[idx % pool.length]);
  });
  return map;
}

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Recommendations() {
  const router = useRouter();
  const { petId } = router.query;

  const [profile, setProfile]           = useState<Record<string, unknown> | null>(null);
  const [apiData, setApiData]           = useState<RecommendationResponse | null>(null);
  const [clickLog, setClickLog]         = useState<{ productId: string; productName: string; timestamp: string }[]>([]);
  const [likedIds, setLikedIds]         = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animateBars, setAnimateBars]   = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('petProfile');
    const savedRecs    = localStorage.getItem('apiRecommendations');
    const savedLog     = localStorage.getItem('clickLog');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedRecs)    setApiData(JSON.parse(savedRecs));
    if (savedLog) {
      const parsed = JSON.parse(savedLog);
      setClickLog(parsed);
      setLikedIds(parsed.map((l: { productId: string }) => l.productId));
    }

    setMounted(true);
    const timer = setTimeout(() => setAnimateBars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (productId: string, productName: string) => {
    if (likedIds.includes(productId)) return;
    const newLikedIds = [...likedIds, productId];
    const newLog = [...clickLog, { productId, productName, timestamp: new Date().toISOString() }];
    setLikedIds(newLikedIds);
    setClickLog(newLog);
    localStorage.setItem('clickLog', JSON.stringify(newLog));
  };

  const clearInterests = () => {
    setLikedIds([]);
    setClickLog([]);
    localStorage.removeItem('clickLog');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      router.push('/profile');
    }, 500);
  };

  if (!mounted) return null;

  const products: RecommendationItem[] = apiData?.recommendations ?? [];
  const emojiMap = buildEmojiMap(products);
  const modelVersion = apiData?.model_version ?? (clickLog.length >= 2 ? 'v2' : 'v1');

  return (
    <Layout>
      <Head>
        <title>Recommendations — PetNutrition AI</title>
      </Head>

      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container">

          {/* No profile state */}
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
              {/* Pet Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div style={{ fontSize: '48px' }}>{profile.species === 'dog' ? '🐕' : '🐱'}</div>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '4px' }}>
                    Top Picks for{' '}
                    <span style={{ background: 'linear-gradient(135deg,var(--accent-light),var(--orange))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {String(profile.name)}
                    </span>{' '}
                    🐾
                  </h1>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {!!profile.breed   && <span className="badge badge-purple">{String(profile.breed)}</span>}
                    {!!profile.age     && <span className="badge badge-orange">{String(profile.age)} yrs</span>}
                    {!!profile.weight  && <span className="badge badge-teal">{String(profile.weight)} kg</span>}
                    {(profile.conditions as string[])?.map((c) => (
                      <span key={c} className="badge badge-pink">🏥 {c}</span>
                    ))}
                    {(profile.goals as string[])?.map((g) => (
                      <span key={g} className="badge badge-yellow">🎯 {g}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adaptive banner after 2+ interactions */}
              {clickLog.length >= 2 && (
                <div className="adaptive-banner" style={{ marginBottom: '20px' }}>
                  <div className="banner-icon">🔄</div>
                  <div className="banner-text">
                    <strong>Recommendations updated based on your interests!</strong>
                    <p>You&apos;ve expressed interest in {clickLog.length} product(s).</p>
                  </div>
                  <span className="badge badge-teal">Adaptive · V2</span>
                </div>
              )}

              {/* Model Info Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-purple">🤖 {apiData?.model_used ?? 'Model'} {modelVersion}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Ranked by relevance score</span>
                  {petId && <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Session #{petId}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? '⏳ Refreshing…' : '🔄 Re-profile'}
                  </button>
                  <Link href="/profile" className="btn btn-ghost btn-sm">✏️ Edit Profile</Link>
                </div>
              </div>

              {/* No recommendations fallback */}
              {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <p>No recommendations returned. The backend may still be loading its model.</p>
                  <Link href="/profile" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                    Try Again
                  </Link>
                </div>
              )}

              {/* Recommendation Grid */}
              {products.length > 0 && (
                <div className="rec-grid">
                  {products.map((p, i) => {
                    const rankNum = i + 1;
                    const isLiked = likedIds.includes(p.food_id);
                    const scoreInt = Math.round(p.score);

                    return (
                      <div key={p.food_id} className="rec-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className={`rank-badge rank-${Math.min(rankNum, 3)}`}>{rankMedal(rankNum)}</div>
                        <div className="product-img" style={{ fontSize: '72px' }}>{emojiMap.get(p.food_id) ?? '🐾'}</div>

                        <div className="card-body">
                          <div className="product-brand">{p.brand}</div>
                          <div className="product-name">{p.name}</div>

                          <div className="score-wrap">
                            <div className="score-header">
                              <span className="score-label">Relevance Score</span>
                              <span className="score-val">{scoreInt}/100</span>
                            </div>
                            <div className="score-bar">
                              <div className="score-fill" style={{
                                background: SCORE_COLORS[i % SCORE_COLORS.length],
                                width: animateBars ? `${scoreInt}%` : '0%'
                              }}></div>
                            </div>
                          </div>

                          {p.match_reasons?.[0] && (
                            <div className="rec-reason">
                              <span className="reason-icon">💡</span>{p.match_reasons[0]}
                            </div>
                          )}

                          {/* Nutrition quick stats */}
                          {p.nutritional_content && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', fontSize: '12px', color: 'var(--text-3)' }}>
                              <span>Protein: {p.nutritional_content.protein}%</span>
                              <span>·</span>
                              <span>Fat: {p.nutritional_content.fat}%</span>
                              <span>·</span>
                              <span>Fiber: {p.nutritional_content.fiber}%</span>
                            </div>
                          )}

                          <div className="rec-tags">
                            {p.badges?.map((b) => <span key={b} className="rec-tag rec-tag-teal">{b}</span>)}
                            {p.tags?.map((t) => <span key={t} className="rec-tag rec-tag-purple">{t}</span>)}
                            {p.price_usd > 0 && (
                              <span className="rec-tag rec-tag-orange">${p.price_usd.toFixed(2)}</span>
                            )}
                            {p.avg_rating > 0 && (
                              <span className="rec-tag rec-tag-purple">⭐ {p.avg_rating.toFixed(1)}</span>
                            )}
                          </div>

                          <div className="card-actions">
                            <button className={`btn btn-like ${isLiked ? 'liked' : ''}`}
                              onClick={() => handleLike(p.food_id, p.name)}>
                              {isLiked ? '❤️ Interested' : '🤍 Interested'}
                            </button>
                            <Link href={`/product/${p.food_id}`} className="btn btn-outline">
                              🔍 View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: '14px' }} onClick={clearInterests}>
                      Clear My Interests
                    </button>
                  </div>
                </div>
              )}

              {/* API metadata footer */}
              {apiData && (
                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
                  Generated at {new Date(apiData.generated_at).toLocaleString()} · {apiData.model_used} {apiData.model_version}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}