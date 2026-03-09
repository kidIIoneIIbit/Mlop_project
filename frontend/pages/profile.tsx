// pages/profile.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { fetchBreeds, postRecommendations, Breed } from '@/lib/api';

const CONDITIONS_LIST = ['Kidney Disease', 'Obesity / Overweight', 'Food Allergies', 'Sensitive Stomach', 'Joint Care'];
const GOALS_LIST = ['General Wellness', 'Weight Loss', 'Active Lifestyle', 'Senior Care', 'Coat & Skin'];
const ACTIVITY_LEVELS = ['low', 'medium', 'high'];

export default function Profile() {
  const router = useRouter();

  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [breedId, setBreedId] = useState('');
  const [activityLevel, setActivityLevel] = useState('medium');
  const [conditions, setConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch breeds from API when species changes
  useEffect(() => {
    setLoadingBreeds(true);
    setError('');
    fetchBreeds(species)
      .then((res) => {
        const list = res.data.breeds ?? [];
        setBreeds(list);
        setBreedId(list.length > 0 ? list[0].id : '');
      })
      .catch(() => setError('Failed to load breeds'))
      .finally(() => setLoadingBreeds(false));
  }, [species]);

  // ฟังก์ชันสลับเลือก Chip (Conditions & Goals)
  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Submit form → call recommendation API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const petProfile = {
      name,
      species,
      breed_id: breedId,
      age_years: Number(age),
      weight_kg: Number(weight),
      activity_level: activityLevel,
      health_conditions: conditions,
      goals,
      top_k: 6,
    };

    try {
      const res = await postRecommendations(petProfile);
      // Store both profile and recommendations for the results page
      localStorage.setItem('petProfile', JSON.stringify({ ...petProfile, breed: breeds.find(b => b.id === breedId)?.name ?? breedId }));
      localStorage.setItem('apiRecommendations', JSON.stringify(res.data));
      router.push('/results/1');
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Failed to get recommendations. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Create Pet Profile — PetNutrition AI</title>
      </Head>

      <div className="form-page" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
        <div className="container-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
          
          {/* Steps indicator */}
          <div className="steps" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '12px' }}>
            <div className="step active" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <div style={{ fontWeight: 'bold' }}>Pet Info</div>
            </div>
            <div style={{ width: '40px', height: '2px', background: 'var(--border)' }}></div>
            <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-3)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              <div>Match</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Card: Basic Info */}
            <div className="card fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>🐶 Basic Information</h2>
              
              {/* Species Toggle */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button type="button" onClick={() => setSpecies('dog')} className={`btn ${species === 'dog' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                  🐕 Dog
                </button>
                <button type="button" onClick={() => setSpecies('cat')} className={`btn ${species === 'cat' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                  🐱 Cat
                </button>
              </div>

              {/* Name Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Pet Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Buddy" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
              </div>

              {/* Breed Select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Breed</label>
                <select value={breedId} onChange={(e) => setBreedId(e.target.value)} disabled={loadingBreeds} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }}>
                  {loadingBreeds ? (
                    <option>Loading...</option>
                  ) : (
                    breeds.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Age & Weight Row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Age (Years)</label>
                  <input type="number" step="0.1" required value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 3.5" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Weight (kg)</label>
                  <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 12" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Activity Level</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }}>
                  {ACTIVITY_LEVELS.map((l) => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card: Health & Goals */}
            <div className="card fade-in" style={{ animationDelay: '0.1s', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>🏥 Health & Goals (Optional)</h2>
              
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Known Health Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {CONDITIONS_LIST.map((c) => (
                  <div key={c} onClick={() => toggleSelection(c, conditions, setConditions)} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${conditions.includes(c) ? 'var(--pink)' : 'var(--border)'}`, background: conditions.includes(c) ? 'rgba(253, 121, 168, 0.1)' : 'transparent', color: conditions.includes(c) ? 'var(--pink)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                    {c}
                  </div>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Primary Nutrition Goals</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {GOALS_LIST.map((g) => (
                  <div key={g} onClick={() => toggleSelection(g, goals, setGoals)} style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${goals.includes(g) ? 'var(--teal)' : 'var(--border)'}`, background: goals.includes(g) ? 'rgba(0, 201, 167, 0.1)' : 'transparent', color: goals.includes(g) ? 'var(--teal)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                    {g}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,0,0,0.1)', color: '#e74c3c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? '⏳ Generating...' : '✨ Generate Recommendations'}
            </button>
          </form>

        </div>
      </div>
    </Layout>
  );
}