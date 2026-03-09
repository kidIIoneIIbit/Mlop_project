// pages/compare.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getFoods, type FoodDetail } from '@/lib/api';
import { type RecommendationItem } from '@/lib/api';

const MAX_COMPARE = 3;

// 3 unique emojis per category (30 total, zero overlap across all pools)
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

/** Assign a unique emoji to each food by counting per-category. */
function buildEmojiMap(foods: FoodDetail[]): Map<string, string> {
  const map: Map<string, string> = new Map();
  const counter: Record<string, number> = {};
  foods.forEach((food) => {
    const sp  = food.species?.toLowerCase() === 'cat' ? 'cat' : 'dog';
    const key = `${sp}_${food.food_type?.toLowerCase()}`;
    const idx = counter[key] ?? 0;
    counter[key] = idx + 1;
    const pool = FOOD_EMOJI_POOL[key] ?? [sp === 'cat' ? '🐱' : '🐕'];
    map.set(food.id, pool[idx % pool.length]);
  });
  return map;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Find the index of the "best" value in an array; returns -1 if all equal. */
function bestIdx(values: number[], mode: 'max' | 'min'): number {
  if (values.every((v) => v === values[0])) return -1;
  const target = mode === 'max' ? Math.max(...values) : Math.min(...values);
  return values.findIndex((v) => v === target);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Compare() {
  const [allFoods, setAllFoods]       = useState<FoodDetail[]>([]);
  const [emojiMap, setEmojiMap]       = useState<Map<string, string>>(new Map());
  const [selected, setSelected]       = useState<FoodDetail[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [mounted, setMounted]         = useState(false);
  const [speciesFilter, setSpeciesFilter] = useState<'dog' | 'cat' | 'all'>('all');

  useEffect(() => {
    setMounted(true);

    // Try to pre-load species from stored pet profile
    const savedProfile = localStorage.getItem('petProfile');
    const savedRecs    = localStorage.getItem('apiRecommendations');
    let detectedSpecies: 'dog' | 'cat' | 'all' = 'all';

    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      if (p.species === 'dog' || p.species === 'cat') detectedSpecies = p.species;
    }
    setSpeciesFilter(detectedSpecies);

    // If we already have recommendations, seed the selected list from them
    const preSelected: FoodDetail[] = [];
    if (savedRecs) {
      const recs: { recommendations: RecommendationItem[] } = JSON.parse(savedRecs);
      recs.recommendations?.slice(0, MAX_COMPARE).forEach((r) => {
        preSelected.push({
          id:                  r.food_id,
          name:                r.name,
          brand:               r.brand,
          species:             r.species,
          food_type:           r.food_type,
          nutritional_content: r.nutritional_content,
          tags:                r.tags,
          certifications:      [],
          badges:              r.badges,
          price_usd:           r.price_usd,
          avg_rating:          r.avg_rating,
        });
      });
    }

    // Fetch full food list from backend
    getFoods()
      .then((foods) => {
        setAllFoods(foods);
        setEmojiMap(buildEmojiMap(foods));
        // Merge pre-selected: use full data if available, else use rec data
        if (preSelected.length > 0) {
          const merged = preSelected.map((pre) => {
            const full = foods.find((f) => f.id === pre.id);
            return full ?? pre;
          });
          setSelected(merged);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const visibleFoods = allFoods.filter((f) =>
    speciesFilter === 'all' ? true : f.species === speciesFilter
  );

  const toggleFood = (food: FoodDetail) => {
    if (selected.find((s) => s.id === food.id)) {
      setSelected(selected.filter((s) => s.id !== food.id));
    } else if (selected.length < MAX_COMPARE) {
      setSelected([...selected, food]);
    }
  };

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  // ── Comparison rows ────────────────────────────────────────────────────────

  const rows: { label: string; getValue: (f: FoodDetail) => number; unit: string; best: 'max' | 'min' | null }[] = [
    { label: 'Price (USD)',       getValue: (f) => f.price_usd,                         unit: '$',         best: 'min' },
    { label: 'Protein',          getValue: (f) => f.nutritional_content.protein,        unit: '%',         best: 'max' },
    { label: 'Fat',               getValue: (f) => f.nutritional_content.fat,            unit: '%',         best: null  },
    { label: 'Fiber',             getValue: (f) => f.nutritional_content.fiber,          unit: '%',         best: 'max' },
    { label: 'Calories',         getValue: (f) => f.nutritional_content.kcal_per_100g ?? 0, unit: 'kcal/100g', best: null },
    { label: 'Avg Rating',       getValue: (f) => f.avg_rating,                         unit: '/ 5',       best: 'max' },
  ];

  if (!mounted) return null;

  return (
    <Layout>
      <Head><title>Compare Foods — PetNutrition AI</title></Head>

      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>⚖️ Food Comparator</h1>
            <p style={{ color: 'var(--text-2)' }}>Select up to {MAX_COMPARE} foods to compare side-by-side.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(217,107,107,0.1)', border: '1px solid var(--pink)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: 'var(--pink)', fontSize: '14px' }}>
              {error} — <Link href="/profile" style={{ color: 'var(--pink)', fontWeight: 700 }}>Go back to profile</Link>
            </div>
          )}

          {/* ── Food picker ────────────────────────────────────────────── */}
          <div className="card fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>

            {/* Species filter */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 700 }}>Filter:</span>
              {(['all', 'dog', 'cat'] as const).map((s) => (
                <button key={s} onClick={() => setSpeciesFilter(s)}
                  className={`btn btn-sm ${speciesFilter === s ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}>
                  {s === 'dog' ? '🐕 Dog' : s === 'cat' ? '🐱 Cat' : 'All'}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-3)' }}>
                {selected.length}/{MAX_COMPARE} selected
              </span>
            </div>

            {/* Food chip grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>Loading foods from backend…</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {visibleFoods.map((food) => {
                  const sel = isSelected(food.id);
                  const disabled = !sel && selected.length >= MAX_COMPARE;
                  return (
                    <button key={food.id} onClick={() => !disabled && toggleFood(food)}
                      style={{
                        padding: '8px 14px', borderRadius: '20px', fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer',
                        border: `1px solid ${sel ? 'var(--teal)' : 'var(--border)'}`,
                        background: sel ? 'rgba(0,201,167,0.12)' : 'transparent',
                        color: sel ? 'var(--teal)' : disabled ? 'var(--text-3)' : 'var(--text-2)',
                        fontWeight: sel ? 700 : 400,
                        transition: 'all 0.15s',
                        opacity: disabled ? 0.5 : 1,
                      }}>
                      {emojiMap.get(food.id) ?? '🐾'} {food.name}
                      <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text-3)' }}>({food.brand})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Comparison table ──────────────────────────────────────────── */}
          {selected.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚖️</div>
              <p>Select at least one food above to start comparing.</p>
              {!localStorage.getItem('apiRecommendations') && (
                <Link href="/profile" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                  Get Recommendations First →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(123,111,240,0.07)' }}>
                    <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', width: '22%', fontSize: '13px', color: 'var(--text-2)' }}>
                      Feature
                    </th>
                    {selected.map((food) => (
                      <th key={food.id} style={{ padding: '20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{emojiMap.get(food.id) ?? '🐾'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{food.brand}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px' }}>{food.name}</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {food.badges.slice(0, 2).map((b) => (
                            <span key={b} className="rec-tag rec-tag-teal" style={{ fontSize: '10px' }}>{b}</span>
                          ))}
                          <span className="rec-tag rec-tag-purple" style={{ fontSize: '10px', textTransform: 'capitalize' }}>{food.food_type}</span>
                        </div>
                        <button onClick={() => toggleFood(food)}
                          style={{ marginTop: '8px', fontSize: '11px', color: 'var(--pink)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          ✕ Remove
                        </button>
                      </th>
                    ))}
                    {/* Empty columns if fewer than MAX_COMPARE selected */}
                    {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                      <th key={`empty-${i}`} style={{ padding: '20px', borderBottom: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-3)' }}>
                        <div style={{ fontSize: '28px', opacity: 0.3 }}>＋</div>
                        <div style={{ fontSize: '12px', marginTop: '8px' }}>Add food</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const values = selected.map((f) => row.getValue(f));
                    const best   = row.best ? bestIdx(values, row.best) : -1;

                    return (
                      <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '13px', color: 'var(--text-2)' }}>
                          {row.label}
                        </td>
                        {selected.map((food, i) => {
                          const val      = row.getValue(food);
                          const isBest   = best === i;
                          const display  = row.label === 'Price (USD)' ? `$${val.toFixed(2)}` : row.label === 'Avg Rating' ? `${val.toFixed(1)} ⭐` : `${val}${row.unit}`;
                          return (
                            <td key={food.id} style={{ padding: '16px 20px', textAlign: 'center', fontWeight: isBest ? 800 : 400, color: isBest ? 'var(--teal)' : 'var(--text-1)', fontSize: '15px' }}>
                              {display}
                              {isBest && <span style={{ display: 'block', fontSize: '10px', color: 'var(--teal)', marginTop: '2px' }}>
                                {row.best === 'min' ? 'Best price' : 'Highest'}
                              </span>}
                            </td>
                          );
                        })}
                        {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                          <td key={`empty-${i}`} style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--border)' }}>—</td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* Tags row */}
                  <tr>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '13px', color: 'var(--text-2)' }}>Tags</td>
                    {selected.map((food) => (
                      <td key={food.id} style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                          {food.tags.slice(0, 4).map((t) => (
                            <span key={t} className="rec-tag rec-tag-purple" style={{ fontSize: '11px' }}>{t}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                      <td key={`empty-${i}`} style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--border)' }}>—</td>
                    ))}
                  </tr>

                  {/* Certifications row */}
                  <tr>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: '13px', color: 'var(--text-2)' }}>Certifications</td>
                    {selected.map((food) => (
                      <td key={food.id} style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                          {food.certifications.length > 0
                            ? food.certifications.map((c) => <span key={c} className="rec-tag rec-tag-orange" style={{ fontSize: '11px' }}>{c}</span>)
                            : <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>—</span>}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                      <td key={`empty-${i}`} style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--border)' }}>—</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer actions */}
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/results/1" className="btn btn-ghost">← Back to Recommendations</Link>
            <Link href="/profile" className="btn btn-primary">New Profile →</Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
