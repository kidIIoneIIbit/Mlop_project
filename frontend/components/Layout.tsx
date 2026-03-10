// components/Layout.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [petName, setPetName] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved pet profile
    const saved = localStorage.getItem('petProfile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setPetName(p.name || null);
      } catch { setPetName(null); }
    }

    // Listen for storage changes (when profile is updated from another page)
    const handleStorage = () => {
      const s = localStorage.getItem('petProfile');
      if (s) {
        try { setPetName(JSON.parse(s).name || null); } catch { setPetName(null); }
      } else {
        setPetName(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router.pathname]); // re-check when navigating

  const isActive = (path: string) => {
    if (path === '/' && router.pathname === '/') return 'active';
    if (path !== '/' && router.pathname.startsWith(path)) return 'active';
    return '';
  };

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-icon" style={{ fontSize: '36px' }}>🐾</div>
          <div className="brand-text">
            <div className="name" style={{ fontSize: '20px', fontWeight: 900 }}>PetNutrition</div>
            <div className="sub" style={{ fontSize: '13px', opacity: 0.8 }}>Powered by ML</div>
          </div>
        </Link>
        <nav className="nav-links">
          <Link href="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link href="/profile" className={`nav-link ${isActive('/profile') || isActive('/results')}`}>Get Recommendation</Link>
          <Link href="/my-pet" className={`nav-link nav-link-highlight ${isActive('/my-pet')}`}>
            🐾 My Pet Profile{petName ? ` · ${petName}` : ''}
          </Link>
          <Link href="/compare" className={`nav-link ${isActive('/compare')}`}>Compare</Link>
          <Link href="/admin" className={`nav-link ${isActive('/admin')}`}>Admin Demo</Link>
        </nav>
        <Link href="/profile" className="btn btn-primary">
          <span className="emoji">🐾</span> Start Recommendation
        </Link>
      </header>

      <main>{children}</main>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)', fontSize: '13px', borderTop: '1px solid var(--border)' }}>
        🐾 PetNutrition · Built with ❤️ for pets everywhere · <Link href="/admin" style={{ color: 'var(--text-3)' }}>Admin</Link>
      </footer>
    </>
  );
}