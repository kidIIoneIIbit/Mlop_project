// components/Layout.tsx
import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand">
          <div className="brand-icon" style={{ fontSize: '36px' }}>🐾</div>
          <div className="brand-text">
            <div className="name" style={{ fontSize: '20px', fontWeight: 900 }}>PetNutrition AI</div>
            <div className="sub" style={{ fontSize: '13px', opacity: 0.8 }}>Powered by ML</div>
          </div>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link active">Home</Link>
          <Link href="/profile" className="nav-link">Get Recommendation</Link>
          <Link href="/admin" className="nav-link">Admin Demo</Link>
        </nav>
        <Link href="/profile" className="btn btn-primary">
          <span className="emoji">🐾</span> Start Recommendation
        </Link>
      </header>

      <main>{children}</main>

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)', fontSize: '13px', borderTop: '1px solid var(--border)' }}>
        🐾 PetNutrition AI · Built with ❤️ for pets everywhere · <Link href="/admin" style={{ color: 'var(--text-3)' }}>Admin</Link>
      </footer>
    </>
  );
}