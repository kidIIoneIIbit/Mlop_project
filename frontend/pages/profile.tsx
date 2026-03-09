// pages/profile.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { getBreeds, getRecommendations, type BreedOption } from '@/lib/api';

// ── Fallback breed names (used if the API is unavailable) ────────────────────
const FALLBACK_BREEDS: Record<'dog' | 'cat', string[]> = {
  dog: [
    'Mix / Unknown', 'Golden Retriever', 'Labrador Retriever', 'German Shepherd',
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund',
    'Siberian Husky', 'Shih Tzu', 'Pomeranian', 'Chihuahua', 'Border Collie',
    'Maltese', 'Yorkshire Terrier', 'Boxer', 'Great Dane', 'Corgi'
  ],
  cat: [
    'Mix / Unknown', 'Persian', 'Maine Coon', 'Siamese', 'British Shorthair',
    'Scottish Fold', 'Ragdoll', 'American Shorthair', 'Sphynx', 'Bengal',
    'Abyssinian', 'Burmese', 'Russian Blue', 'Norwegian Forest', 'Birman'
  ]
};

// Build BreedOption list from fallback names when the API fails
function fallbackOptions(species: 'dog' | 'cat'): BreedOption[] {
  return FALLBACK_BREEDS[species].map((name) => ({
    breed_id: `${species}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
  }));
}

// ── Conditions displayed in UI → backend health_conditions values ─────────────
const CONDITIONS_LIST = [
  'Kidney Disease',
  'Obesity / Overweight',
  'Food Allergies',
  'Sensitive Stomach',
  'Joint Care',
] as const;

const CONDITION_MAP: Record<string, string> = {
  'Kidney Disease':        'kidney',
  'Obesity / Overweight':  'weight',
  'Food Allergies':        'skin',
  'Sensitive Stomach':     'digestive',
  'Joint Care':            'joint',
};

const GOALS_LIST = [
  'General Wellness', 'Weight Loss', 'Active Lifestyle', 'Senior Care', 'Coat & Skin',
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const router = useRouter();

  // Form state
  const [species, setSpecies]               = useState<'dog' | 'cat'>('dog');
  const [name, setName]                     = useState('');
  const [selectedBreedId, setSelectedBreedId] = useState('');
  const [breedOptions, setBreedOptions]     = useState<BreedOption[]>([]);
  const [age, setAge]                       = useState<number | ''>('');
  const [weight, setWeight]                 = useState<number | ''>('');
  const [activityLevel, setActivityLevel]   = useState<'high' | 'medium' | 'low'>('medium');
  const [conditions, setConditions]         = useState<string[]>([]);
  const [goals, setGoals]                   = useState<string[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  // Fetch breeds from API whenever species changes; fall back to static list on error
  useEffect(() => {
    let cancelled = false;
    setBreedOptions([]);
    setSelectedBreedId('');

    getBreeds(species)
      .then((data) => {
        if (cancelled) return;
        const options = data.length > 0 ? data : fallbackOptions(species);
        setBreedOptions(options);
        setSelectedBreedId(options[0]?.breed_id ?? '');
      })
      .catch(() => {
        if (cancelled) return;
        const options = fallbackOptions(species);
        setBreedOptions(options);
        setSelectedBreedId(options[0]?.breed_id ?? '');
      });

    return () => { cancelled = true; };
  }, [species]);

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (age === '' || weight === '') return;

    setIsSubmitting(true);
    setError(null);

    // Map UI condition labels → backend keys
    const mappedConditions = conditions.map((c) => CONDITION_MAP[c]).filter(Boolean);

    // Display-friendly profile stored for the results page header
    const displayProfile = {
      name, species,
      breed: breedOptions.find((b) => b.breed_id === selectedBreedId)?.name ?? selectedBreedId,
      age, weight, conditions, goals,
    };

    try {
      const result = await getRecommendations({
        name,
        species,
        breed_id: selectedBreedId,
        age_years: age as number,
        weight_kg: weight as number,
        activity_level: activityLevel,
        health_conditions: mappedConditions,
        top_k: 6,
      });

      // Persist both the display profile and the raw API response
      localStorage.setItem('petProfile', JSON.stringify(displayProfile));
      localStorage.setItem('apiRecommendations', JSON.stringify(result));

      router.push('/results/1');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not get recommendations: ${message}`);
      setIsSubmitting(false);
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

          {/* Error banner */}
          {error && (
            <div style={{ background: 'rgba(217,107,107,0.1)', border: '1px solid var(--pink)', borderRadius: '12px', padding: '16px', marginBottom: '20px', color: 'var(--pink)', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Card: Basic Info */}
            <div className="card fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Basic Information</h2>

              {/* Species Toggle */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button type="button" onClick={() => setSpecies('dog')} className={`btn ${species === 'dog' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                  Dog
                </button>
                <button type="button" onClick={() => setSpecies('cat')} className={`btn ${species === 'cat' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>
                  Cat
                </button>
              </div>

              {/* Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Pet Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Buddy"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
              </div>

              {/* Breed */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Breed</label>
                <select value={selectedBreedId} onChange={(e) => setSelectedBreedId(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }}>
                  {breedOptions.length === 0 && <option>Loading breeds…</option>}
                  {breedOptions.map((b) => (
                    <option key={b.breed_id} value={b.breed_id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Age & Weight */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Age (Years)</label>
                  <input type="number" step="0.1" min="0" required value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 3.5"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Weight (kg)</label>
                  <input type="number" step="0.1" min="0" required value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 12"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Activity Level</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button key={level} type="button"
                      onClick={() => setActivityLevel(level)}
                      className={`btn ${activityLevel === level ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1, textTransform: 'capitalize' }}>
                      {level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card: Health & Goals */}
            <div className="card fade-in" style={{ animationDelay: '0.1s', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Health &amp; Goals (Optional)</h2>

              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Known Health Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {CONDITIONS_LIST.map((c) => (
                  <div key={c} onClick={() => toggleSelection(c, conditions, setConditions)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${conditions.includes(c) ? 'var(--pink)' : 'var(--border)'}`, background: conditions.includes(c) ? 'rgba(253,121,168,0.1)' : 'transparent', color: conditions.includes(c) ? 'var(--pink)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                    {c}
                  </div>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>Primary Nutrition Goals</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {GOALS_LIST.map((g) => (
                  <div key={g} onClick={() => toggleSelection(g, goals, setGoals)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: `1px solid ${goals.includes(g) ? 'var(--teal)' : 'var(--border)'}`, background: goals.includes(g) ? 'rgba(0,201,167,0.1)' : 'transparent', color: goals.includes(g) ? 'var(--teal)' : 'var(--text-2)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Getting recommendations…' : 'Generate Recommendations'}
            </button>
          </form>

        </div>
      </div>
    </Layout>
  );
}
