// ============================================================================
// ReWear — Global Footer Component (src/components/Footer.jsx)
// ============================================================================

import { Link, useLocation } from 'react-router-dom';

function Footer() {
  const location = useLocation();
  const path = location.pathname;

  // For chat and split-screen auth, show a minimal version or omit
  const isAuthPage = path === '/login' || path === '/signup';
  const isChatPage = path.startsWith('/chat') || path === '/negotiation';

  if (isChatPage) {
    return null;
  }

  if (isAuthPage) {
    return (
      <footer className="footerMinimal">
        <div className="footerMinimalContent">
          <span>re<span style={{ color: 'var(--sage)' }}>wear</span>. — Wear less new. Swap more.</span>
          <div className="footerMinimalLinks">
            <Link to="/">Home</Link>
            <Link to="/browse">Explore</Link>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <span className="footerCopyright">© {new Date().getFullYear()} ReWear. Sustainable Fashion Exchange.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footerMain">
        <div className="footerBrand">
          <Link to="/" className="footerLogo">
            re<span>wear</span>.
          </Link>
          <p className="footerTagline">
            Wear less new. Swap more. The conscious community marketplace for extending the life of garments you already own.
          </p>
          <div className="footerImpactBadge">
            <span className="impactLeaf">🌱</span>
            <span>Every swap keeps valuable textiles out of landfills and saves ~4.2 kg CO₂e.</span>
          </div>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Marketplace</h4>
          <ul className="footerLinks">
            <li><Link to="/browse">Explore Wardrobe</Link></li>
            <li><Link to="/additem">List a Piece</Link></li>
            <li><Link to="/how-it-works">How It Works</Link></li>
            <li><Link to="/browse?category=Jacket">Jackets & Coats</Link></li>
            <li><Link to="/browse?category=Dress">Dresses & Tops</Link></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Community</h4>
          <ul className="footerLinks">
            <li><Link to="/community">Community Hub & Circles</Link></li>
            <li><Link to="/how-it-works">Fair Value Guidance</Link></li>
            <li><Link to="/browse">Nearby Exchanges</Link></li>
            <li><Link to="/profile">My Swap Dashboard</Link></li>
            <li><Link to="/profile?tab=history">Swap History</Link></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4 className="footerColTitle">Principles</h4>
          <div className="footerMottoBox">
            <b>Swap, don’t shop.</b>
            <p className="muted" style={{ fontSize: '13px', margin: '6px 0 0' }}>
              No money transactions. Fair community swaps powered by estimated item valuation.
            </p>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        <div className="footerBottomLeft">
          <span>© {new Date().getFullYear()} ReWear. All rights reserved.</span>
          <span className="footerDot">·</span>
          <span>Designed for conscious wardrobes</span>
        </div>
        <div className="footerBottomRight">
          <Link to="/">Home</Link>
          <Link to="/browse">Explore</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/community">Community</Link>
          <Link to="/profile">My Account</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
