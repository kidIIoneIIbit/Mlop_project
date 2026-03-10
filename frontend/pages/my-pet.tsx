// pages/my-pet.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { fetchBreeds, Breed } from '@/lib/api';

const CONDITIONS_LIST = ['Kidney Disease', 'Obesity / Overweight', 'Food Allergies', 'Sensitive Stomach', 'Joint Care'];
const GOALS_LIST = ['General Wellness', 'Weight Loss', 'Active Lifestyle', 'Senior Care', 'Coat & Skin'];
const ACTIVITY_LEVELS = ['low', 'medium', 'high'];

export default function MyPetProfile() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);

  // Edit form state
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [breedId, setBreedId] = useState('');
  const [breedName, setBreedName] = useState('');
  const [activityLevel, setActivityLevel] = useState('medium');
  const [conditions, setConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('petProfile');
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      // Populate edit fields
      setSpecies(p.species || 'dog');
      setName(p.name || '');
      setAge(p.age_years ?? p.age ?? '');
      setWeight(p.weight_kg ?? p.weight ?? '');
      setBreedId(p.breed_id || '');
      setBreedName(p.breed || '');
      setActivityLevel(p.activity_level || 'medium');
      setConditions(p.health_conditions || []);
      setGoals(p.goals || []);
    }
    setMounted(true);
  }, []);

  // Fetch breeds when species changes (only in edit mode)
  useEffect(() => {
    if (!isEditing) return;
    setLoadingBreeds(true);
    fetchBreeds(species)
      .then((res) => {
        const list = res.data.breeds ?? [];
        setBreeds(list);
        if (!list.find((b: Breed) => b.id === breedId)) {
          setBreedId(list.length > 0 ? list[0].id : '');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBreeds(false));
  }, [species, isEditing]);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const selectedBreed = breeds.find((b) => b.id === breedId);
    const updatedProfile = {
      name,
      species,
      breed_id: breedId,
      breed: selectedBreed?.name ?? breedName ?? breedId,
      age_years: Number(age),
      weight_kg: Number(weight),
      activity_level: activityLevel,
      health_conditions: conditions,
      goals,
      top_k: 6,
    };
    localStorage.setItem('petProfile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = () => {
    localStorage.removeItem('petProfile');
    localStorage.removeItem('apiRecommendations');
    localStorage.removeItem('clickLog');
    setProfile(null);
    setIsEditing(false);
  };

  if (!mounted) return null;

  return (
    <Layout>
      <Head>
        <title>My Pet Profile — PetNutrition AI</title>
        <meta name="description" content="View and manage your pet's profile for personalized nutrition recommendations." />
      </Head>

      <div className="form-page" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 64px)' }}>
        <div className="container-sm" style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Page Title */}
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🐾</div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
              My Pet Profile
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '16px' }}>
              {profile ? 'Your pet\'s information at a glance' : 'No pet profile saved yet'}
            </p>
          </div>

          {/* Save Success Banner */}
          {saveSuccess && (
            <div className="adaptive-banner fade-in" style={{ marginBottom: '20px' }}>
              <div className="banner-icon">✅</div>
              <div className="banner-text">
                <strong>Profile updated successfully!</strong>
                <p>Your pet&apos;s information has been saved.</p>
              </div>
            </div>
          )}

          {/* No Profile State */}
          {!profile && !isEditing && (
            <div className="card fade-in" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '20px', padding: '60px 40px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '20px', opacity: 0.6 }}>🐕</div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>
                No Pet Profile Yet
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
                Create your pet&apos;s profile to get personalized nutrition recommendations tailored to their specific needs.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/profile" className="btn btn-primary btn-lg">
                  <span className="emoji">🐶</span> Create via Recommendation
                </Link>
              </div>
            </div>
          )}

          {/* Profile View Mode */}
          {profile && !isEditing && (
            <>
              {/* Profile Card */}
              <div className="card fade-in" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '20px', overflow: 'hidden', marginBottom: '24px'
              }}>
                {/* Profile Header Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(196, 86, 26, 0.15), rgba(196, 154, 42, 0.1))',
                  padding: '32px 28px', display: 'flex', alignItems: 'center', gap: '20px',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--orange))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px', boxShadow: '0 6px 20px rgba(196, 86, 26, 0.3)',
                    flexShrink: 0
                  }}>
                    {profile.species === 'cat' ? '🐱' : '🐶'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '4px' }}>
                      {String(profile.name || 'My Pet')}
                    </h2>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-purple" style={{ fontSize: '12px' }}>
                        {profile.species === 'cat' ? '🐱 Cat' : '🐕 Dog'}
                      </span>
                      {profile.breed && (
                        <span className="badge badge-orange" style={{ fontSize: '12px' }}>
                          {String(profile.breed)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      background: 'rgba(196, 86, 26, 0.06)', borderRadius: '14px', padding: '18px 16px',
                      textAlign: 'center', border: '1px solid rgba(196, 86, 26, 0.1)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)', marginBottom: '4px' }}>
                        {String(profile.age_years ?? profile.age ?? '—')}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Years Old
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(61, 107, 79, 0.06)', borderRadius: '14px', padding: '18px 16px',
                      textAlign: 'center', border: '1px solid rgba(61, 107, 79, 0.1)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--teal)', marginBottom: '4px' }}>
                        {String(profile.weight_kg ?? profile.weight ?? '—')}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        kg Weight
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(196, 154, 42, 0.06)', borderRadius: '14px', padding: '18px 16px',
                      textAlign: 'center', border: '1px solid rgba(196, 154, 42, 0.1)'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--orange)', marginBottom: '4px', textTransform: 'capitalize' }}>
                        {String(profile.activity_level ?? '—')}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Activity
                      </div>
                    </div>
                  </div>

                  {/* Health Conditions */}
                  {(profile.health_conditions as string[])?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-2)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🏥 Health Conditions
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(profile.health_conditions as string[]).map((c: string) => (
                          <span key={c} className="badge badge-pink" style={{ fontSize: '13px', padding: '6px 14px' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Goals */}
                  {(profile.goals as string[])?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-2)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🎯 Nutrition Goals
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(profile.goals as string[]).map((g: string) => (
                          <span key={g} className="badge badge-yellow" style={{ fontSize: '13px', padding: '6px 14px' }}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fade-in" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', animationDelay: '0.1s' }}>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px 24px' }}>
                  ✏️ Edit Profile
                </button>
                <Link href="/profile" className="btn btn-teal" style={{ flex: 1, justifyContent: 'center', padding: '14px 24px' }}>
                  🔄 New Recommendation
                </Link>
                <button onClick={handleDelete} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '14px 24px', color: 'var(--pink)', borderColor: 'rgba(217, 107, 107, 0.3)' }}>
                  🗑️ Delete Profile
                </button>
              </div>
            </>
          )}

          {/* Edit Mode */}
          {isEditing && (
            <form onSubmit={handleSave}>
              <div className="card fade-in" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '28px', marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px' }}>✏️ Edit Pet Information</h2>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">
                    ✕ Cancel
                  </button>
                </div>

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

              {/* Health & Goals Card */}
              <div className="card fade-in" style={{ animationDelay: '0.1s', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>🏥 Health & Goals</h2>

                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Known Health Conditions</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {CONDITIONS_LIST.map((c) => (
                    <div key={c} onClick={() => toggleSelection(c, conditions, setConditions)} style={{
                      padding: '8px 16px', borderRadius: '20px',
                      border: `1px solid ${conditions.includes(c) ? 'var(--pink)' : 'var(--border)'}`,
                      background: conditions.includes(c) ? 'rgba(253, 121, 168, 0.1)' : 'transparent',
                      color: conditions.includes(c) ? 'var(--pink)' : 'var(--text-2)',
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'
                    }}>
                      {c}
                    </div>
                  ))}
                </div>

                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Primary Nutrition Goals</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {GOALS_LIST.map((g) => (
                    <div key={g} onClick={() => toggleSelection(g, goals, setGoals)} style={{
                      padding: '8px 16px', borderRadius: '20px',
                      border: `1px solid ${goals.includes(g) ? 'var(--teal)' : 'var(--border)'}`,
                      background: goals.includes(g) ? 'rgba(0, 201, 167, 0.1)' : 'transparent',
                      color: goals.includes(g) ? 'var(--teal)' : 'var(--text-2)',
                      cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'
                    }}>
                      {g}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center', fontSize: '16px', padding: '16px' }}>
                  💾 Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost btn-lg" style={{ padding: '16px 24px' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
