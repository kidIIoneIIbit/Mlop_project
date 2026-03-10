// pages/compare.tsx
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { fetchFoods, postCompare, FoodDetail, CompareItem } from '@/lib/api';

export default function Compare() {
  // Data state
  const [allFoods, setAllFoods] = useState<FoodDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'dog' | 'cat'>('dog');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Comparison state
  const [comparing, setComparing] = useState(false);
  const [compResult, setCompResult] = useState<CompareItem[] | null>(null);
  const [compWinner, setCompWinner] = useState<CompareItem | null>(null);
  const [compError, setCompError] = useState('');

  // Fetch all foods on mount
  useEffect(() => {
    setLoading(true);
    fetchFoods()
      .then((res) => {
        setAllFoods(res.data.foods ?? []);
      })
      .catch(() => setError('Failed to load products. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  const dogFoods = allFoods.filter((f) => f.species === 'dog');
  const catFoods = allFoods.filter((f) => f.species === 'cat');
  const currentFoods = activeTab === 'dog' ? dogFoods : catFoods;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
    // Reset comparison when selection changes
    setCompResult(null);
    setCompWinner(null);
    setCompError('');
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setCompResult(null);
    setCompWinner(null);
    setCompError('');
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setCompError('Please select at least 2 products to compare.');
      return;
    }

    setComparing(true);
    setCompError('');

    // Build a basic profile for scoring
    const savedProfile = localStorage.getItem('petProfile');
    let profilePayload = {
      species: activeTab,
      breed_id: activeTab === 'dog' ? 'dog-mixed' : 'cat-mixed',
      age_years: 3,
      activity_level: 'medium',
      health_conditions: [] as string[],
    };

    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      profilePayload = {
        species: p.species || activeTab,
        breed_id: p.breed_id || profilePayload.breed_id,
        age_years: p.age_years ?? 3,
        activity_level: p.activity_level ?? 'medium',
        health_conditions: p.health_conditions ?? [],
      };
    }

    try {
      const res = await postCompare({
        food_ids: selectedIds,
        ...profilePayload,
      });
      setCompResult(res.data.comparison);
      setCompWinner(res.data.winner);
    } catch {
      setCompError('Failed to compare. Is the backend running?');
    } finally {
      setComparing(false);
    }
  };

  // Group foods by food_type for display
  const groupByType = (foods: FoodDetail[]) => {
    const groups: Record<string, FoodDetail[]> = {};
    foods.forEach((f) => {
      const type = f.food_type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(f);
    });
    return groups;
  };

  const typeLabels: Record<string, string> = {
    dry: '🥣 Dry Food',
    wet: '🥫 Wet Food',
    raw: '🥩 Raw / Freeze-Dried',
    other: '📦 Other',
  };

  const typeEmoji: Record<string, string> = {
    dry: '🥣',
    wet: '🥫',
    raw: '🥩',
    other: '📦',
  };

  const grouped = groupByType(currentFoods);

  // Find the highest value in each nutrition column for highlighting
  const getCompHighlight = (items: CompareItem[], field: string) => {
    let best = '';
    let bestVal = -1;
    items.forEach((item) => {
      let val = 0;
      if (field === 'score') val = item.score;
      else if (field === 'protein') val = item.nutritional_content?.protein ?? 0;
      else if (field === 'fat') val = item.nutritional_content?.fat ?? 0;
      else if (field === 'fiber') val = item.nutritional_content?.fiber ?? 0;
      else if (field === 'kcal') val = item.nutritional_content?.kcal_per_100g ?? 0;
      else if (field === 'rating') val = item.avg_rating ?? 0;
      else if (field === 'price') val = -(item.price_usd ?? 0); // lower is better

      if (val > bestVal) {
        bestVal = val;
        best = item.food_id;
      }
    });
    return best;
  };

  return (
    <Layout>
      <Head>
        <title>Compare Foods — PetNutrition AI</title>
        <meta name="description" content="Compare pet food products side-by-side with nutritional breakdown." />
      </Head>

      <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Page Header */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>⚖️</div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
              Food Comparator
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '16px' }}>
              Select products to compare side-by-side nutritional breakdown
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float-y 1.5s ease-in-out infinite' }}>🔄</div>
              <p>Loading products...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ background: 'rgba(255,0,0,0.1)', color: '#e74c3c', padding: '16px 24px', borderRadius: '12px', display: 'inline-block', fontSize: '15px' }}>
                ⚠️ {error}
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Category Tabs */}
              <div className="fade-in" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
                <button
                  onClick={() => { setActiveTab('dog'); clearSelection(); }}
                  className={`btn ${activeTab === 'dog' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '12px 32px', fontSize: '16px' }}
                >
                  🐕 Dog Food ({dogFoods.length})
                </button>
                <button
                  onClick={() => { setActiveTab('cat'); clearSelection(); }}
                  className={`btn ${activeTab === 'cat' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '12px 32px', fontSize: '16px' }}
                >
                  🐱 Cat Food ({catFoods.length})
                </button>
              </div>

              {/* Selection counter + actions */}
              <div className="fade-in" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '16px 24px', marginBottom: '24px',
                flexWrap: 'wrap', gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
                    <strong style={{ color: 'var(--accent)', fontSize: '18px' }}>{selectedIds.length}</strong> products selected
                  </span>
                  {selectedIds.length > 0 && (
                    <button onClick={clearSelection} className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>
                      ✕ Clear
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCompare}
                  disabled={selectedIds.length < 2 || comparing}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 28px',
                    opacity: selectedIds.length < 2 ? 0.5 : 1,
                    cursor: selectedIds.length < 2 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {comparing ? '⏳ Comparing...' : `⚖️ Compare Selected (${selectedIds.length})`}
                </button>
              </div>

              {/* Product Grid by Food Type */}
              {Object.entries(grouped).map(([type, foods]) => (
                <div key={type} style={{ marginBottom: '32px' }}>
                  <h2 className="fade-in" style={{
                    fontSize: '18px', fontWeight: 800, marginBottom: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    color: 'var(--text-1)'
                  }}>
                    {typeLabels[type] || `${typeEmoji[type] || '📦'} ${type}`}
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)' }}>
                      ({foods.length} products)
                    </span>
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {foods.map((food) => {
                      const isSelected = selectedIds.includes(food.id);
                      return (
                        <div
                          key={food.id}
                          onClick={() => toggleSelect(food.id)}
                          className="fade-in"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(196, 86, 26, 0.08), rgba(196, 154, 42, 0.06))'
                              : 'var(--bg-card)',
                            border: isSelected
                              ? '2px solid var(--accent)'
                              : '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) (e.currentTarget.style.borderColor = 'rgba(196, 86, 26, 0.4)');
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(44, 24, 16, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) (e.currentTarget.style.borderColor = 'var(--border)');
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Checkbox indicator */}
                          <div style={{
                            position: 'absolute', top: '14px', right: '14px',
                            width: '24px', height: '24px', borderRadius: '8px',
                            border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
                            background: isSelected
                              ? 'linear-gradient(135deg, var(--accent), var(--orange))'
                              : 'rgba(44, 24, 16, 0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', color: 'white', fontWeight: 900,
                            transition: 'all 0.2s'
                          }}>
                            {isSelected && '✓'}
                          </div>

                          {/* Brand */}
                          <div style={{
                            fontSize: '11px', fontWeight: 700, color: 'var(--text-3)',
                            textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px'
                          }}>
                            {food.brand}
                          </div>

                          {/* Name */}
                          <div style={{
                            fontSize: '16px', fontWeight: 800, marginBottom: '12px',
                            paddingRight: '30px', lineHeight: 1.3
                          }}>
                            {food.name}
                          </div>

                          {/* Quick stats row */}
                          <div style={{
                            display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px'
                          }}>
                            <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                              P: {food.nutritional_content.protein}%
                            </span>
                            <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                              F: {food.nutritional_content.fat}%
                            </span>
                            <span className="badge badge-orange" style={{ fontSize: '11px' }}>
                              {food.nutritional_content.kcal_per_100g} kcal
                            </span>
                          </div>

                          {/* Price + Rating row */}
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent)' }}>
                              ${food.price_usd.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 700 }}>
                              ⭐ {food.avg_rating.toFixed(1)}
                            </span>
                          </div>

                          {/* Tags */}
                          {food.tags.length > 0 && (
                            <div style={{
                              display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px'
                            }}>
                              {food.tags.slice(0, 3).map((t) => (
                                <span key={t} style={{
                                  fontSize: '10px', padding: '3px 8px', borderRadius: '99px',
                                  background: 'rgba(44, 24, 16, 0.05)', color: 'var(--text-3)',
                                  fontWeight: 600
                                }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Compare Error */}
              {compError && (
                <div className="fade-in" style={{
                  background: 'rgba(255,0,0,0.1)', color: '#e74c3c',
                  padding: '14px 20px', borderRadius: '12px', marginBottom: '24px',
                  fontSize: '14px', textAlign: 'center'
                }}>
                  ⚠️ {compError}
                </div>
              )}

              {/* Comparison Result Table */}
              {compResult && compResult.length > 0 && (
                <div id="comparison-results" className="fade-in" style={{ marginTop: '16px', marginBottom: '40px' }}>
                  <div className="glow-line" style={{ marginBottom: '32px' }}></div>

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>📊 Comparison Results</h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
                      Nutritional breakdown of your selected products
                    </p>
                  </div>

                  {/* Winner banner */}
                  {compWinner && (
                    <div style={{
                      textAlign: 'center', marginBottom: '24px', padding: '18px 24px',
                      background: 'linear-gradient(135deg, rgba(61, 107, 79, 0.12), rgba(196, 86, 26, 0.08))',
                      borderRadius: '14px', border: '1.5px solid rgba(61, 107, 79, 0.3)'
                    }}>
                      <span style={{ fontSize: '20px' }}>🏆</span>{' '}
                      <strong style={{ fontSize: '17px', color: 'var(--teal-dark)' }}>Best Match:</strong>{' '}
                      <span style={{ fontSize: '17px', fontWeight: 800 }}>
                        {compWinner.name}
                      </span>{' '}
                      <span style={{ color: 'var(--text-3)' }}>({compWinner.brand})</span>{' '}
                      <span className="badge badge-teal" style={{ marginLeft: '8px' }}>
                        Score: {Math.round(compWinner.score)}/100
                      </span>
                    </div>
                  )}

                  {/* Comparison Table */}
                  <div style={{
                    overflowX: 'auto', background: 'var(--bg-card)',
                    borderRadius: '16px', border: '1px solid var(--border)',
                    boxShadow: '0 8px 32px rgba(44, 24, 16, 0.06)'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg, rgba(196, 86, 26, 0.08), rgba(196, 154, 42, 0.06))' }}>
                          <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', width: '18%', fontSize: '13px', fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Feature
                          </th>
                          {compResult.map((item) => (
                            <th key={item.food_id} style={{ padding: '20px', borderBottom: '1px solid var(--border)', textAlign: 'center', minWidth: '160px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                {item.brand}
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.3 }}>
                                {item.name}
                              </div>
                              {compWinner && item.food_id === compWinner.food_id && (
                                <div style={{ marginTop: '8px' }}>
                                  <span style={{
                                    fontSize: '10px', display: 'inline-block',
                                    background: 'linear-gradient(135deg, var(--accent), var(--orange))',
                                    color: 'white', padding: '3px 10px', borderRadius: '12px', fontWeight: 800
                                  }}>
                                    🏆 Winner
                                  </span>
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Match Score', key: 'score', render: (item: CompareItem) => `${Math.round(item.score)}/100`, highlight: true },
                          { label: 'Price (USD)', key: 'price', render: (item: CompareItem) => `$${item.price_usd?.toFixed(2)}`, highlight: true },
                          { label: 'Protein', key: 'protein', render: (item: CompareItem) => `${item.nutritional_content?.protein ?? '-'}%`, highlight: true },
                          { label: 'Fat', key: 'fat', render: (item: CompareItem) => `${item.nutritional_content?.fat ?? '-'}%`, highlight: false },
                          { label: 'Fiber', key: 'fiber', render: (item: CompareItem) => `${item.nutritional_content?.fiber ?? '-'}%`, highlight: false },
                          { label: 'Calories (per 100g)', key: 'kcal', render: (item: CompareItem) => `${item.nutritional_content?.kcal_per_100g ?? '-'} kcal`, highlight: false },
                          { label: 'Rating', key: 'rating', render: (item: CompareItem) => `⭐ ${item.avg_rating?.toFixed(1)}`, highlight: true },
                        ].map((row) => {
                          const bestId = row.highlight ? getCompHighlight(compResult, row.key) : '';
                          return (
                            <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-2)', fontSize: '14px' }}>
                                {row.label}
                              </td>
                              {compResult.map((item) => (
                                <td key={item.food_id} style={{
                                  padding: '14px 20px', textAlign: 'center', fontSize: '15px',
                                  fontWeight: bestId === item.food_id ? 800 : 500,
                                  color: bestId === item.food_id ? 'var(--teal)' : 'var(--text-1)',
                                  background: bestId === item.food_id ? 'rgba(61, 107, 79, 0.06)' : 'transparent',
                                }}>
                                  {row.render(item)}
                                  {bestId === item.food_id && row.key === 'score' && ' 🏆'}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                        {/* Tags row */}
                        <tr>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-2)', fontSize: '14px' }}>
                            Tags
                          </td>
                          {compResult.map((item) => (
                            <td key={item.food_id} style={{ padding: '14px 20px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                {item.tags?.map((t) => (
                                  <span key={t} className="rec-tag rec-tag-purple">{t}</span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        table tr:hover td {
          background: rgba(196, 86, 26, 0.03);
        }
      `}</style>
    </Layout>
  );
}