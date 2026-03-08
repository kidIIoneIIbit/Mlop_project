// pages/profile.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect, FormEvent } from 'react';
import Layout from '@/components/Layout'; // ตรวจสอบ path ให้ตรงกับโฟลเดอร์ของคุณ

// Mock ข้อมูลสายพันธุ์จาก pet-data.js
const BREEDS = {
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

const CONDITIONS_LIST = ['Kidney Disease', 'Obesity / Overweight', 'Food Allergies', 'Sensitive Stomach', 'Joint Care'];
const GOALS_LIST = ['General Wellness', 'Weight Loss', 'Active Lifestyle', 'Senior Care', 'Coat & Skin'];

export default function Profile() {
  const router = useRouter();

  // สร้าง State สำหรับเก็บข้อมูลในฟอร์ม
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [breed, setBreed] = useState('Mix / Unknown');
  const [conditions, setConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  // รีเซ็ตสายพันธุ์ทุกครั้งที่เปลี่ยนชนิดสัตว์เลี้ยง
  useEffect(() => {
    setBreed(BREEDS[species][0]);
  }, [species]);

  // ฟังก์ชันสลับเลือก Chip (Conditions & Goals)
  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // ฟังก์ชัน Submit ฟอร์ม
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // จำลองการจัดเตรียมข้อมูลเพื่อส่งให้ Backend (ตามแพลนของ Person B)
    const petProfile = {
      name, species, breed, age, weight, conditions, goals,
      timestamp: new Date().toISOString()
    };

    // สำหรับตอนนี้เราจะเซฟลง LocalStorage ไว้ก่อน เพื่อจำลองข้อมูลส่งไปหน้า Results
    localStorage.setItem('petProfile', JSON.stringify(petProfile));
    
    // พิมพ์เช็คข้อมูลใน Console
    console.log("Submitting to API:", petProfile);

    // นำทางไปหน้าผลลัพธ์ (สมมติให้ใช้ id เป็น '1' ก่อน ตามแผนที่จะสร้าง pages/results/[petId].tsx)
    router.push('/results/1'); 
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
                <select value={breed} onChange={(e) => setBreed(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }}>
                  {BREEDS[species].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Age & Weight Row */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Age (Years)</label>
                  <input type="number" step="0.1" required value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 3.5" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>Weight (kg)</label>
                  <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 12" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-1)' }} />
                </div>
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

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px' }}>
              ✨ Generate Recommendations
            </button>
          </form>

        </div>
      </div>
    </Layout>
  );
}