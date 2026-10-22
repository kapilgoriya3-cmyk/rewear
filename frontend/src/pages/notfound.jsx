

import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="page-container" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 20px', background: '#fff', borderRadius: '24px', border: '1px solid var(--line, #e2e8f0)', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '72px', fontWeight: '800', color: 'var(--brand-dark, #163300)', lineHeight: '1', marginBottom: '16px' }}>404</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Page not found</h2>
        <p className="muted" style={{ marginBottom: '28px', color: '#64748b', fontSize: '15px' }}>
          The piece or wardrobe page you are looking for might have been moved or does not exist.
        </p>
        <Link to="/" className="btn dark" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '999px' }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound; 


