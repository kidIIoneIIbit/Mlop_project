// components/Layout.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter(); // 👈 เรียกใช้งาน router เพื่อเช็ค URL ปัจจุบัน

  // ฟังก์ชันช่วยเช็คว่าควรใส่คลาส active ไหม
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
          {/* 👇 ใช้เงื่อนไขสลับคลาส active อัตโนมัติตาม URL */}
          <Link href="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link href="/profile" className={`nav-link ${isActive('/profile') || isActive('/results')}`}>Get Recommendation</Link>
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