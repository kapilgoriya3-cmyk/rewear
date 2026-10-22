// ============================================================================
// ReWear — Navbar Component (src/components/navbar.jsx)
// ============================================================================
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import NotificationBell from './NotificationBell';

function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="top">
        <div className="topContainer">
          {/* Brand Logo */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            re<span>wear</span>.
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav" aria-label="Main navigation">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
            <Link to="/browse" className={isActive('/browse') ? 'active' : ''}>
              Explore
            </Link>
            <Link to="/how-it-works" className={isActive('/how-it-works') ? 'active' : ''}>
              How It Works
            </Link>
            <Link to="/community" className={isActive('/community') ? 'active' : ''}>
              Community
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="topRight">
            <Link
              to="/browse"
              className="circle"
              title="Search wardrobe"
              aria-label="Search clothing"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Link>

            <Link
              to="/saved"
              className="circle"
              title={favoritesCount > 0 ? `${favoritesCount} saved item${favoritesCount === 1 ? '' : 's'}` : "Saved items"}
              aria-label="Saved items"
              style={{ position: "relative" }}
              id="navbar-saved-pieces-link"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill={favoritesCount > 0 ? "var(--sage)" : "none"}
                stroke={favoritesCount > 0 ? "var(--sage)" : "currentColor"}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {favoritesCount > 0 && (
                <span
                  id="navbar-favorites-count"
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "var(--sage)",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 800,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {favoritesCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <NotificationBell />
                <Link
                  to="/profile"
                  className="userProfileBadge"
                  title={user.name}
                >
                  <img
                    className="mini"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                    alt={user.name}
                  />
                  <span className="userNameText hide">
                    {user.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline-sm hide"
                  title="Log out of your account"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost hide">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-dark-sm hide">
                  Join ReWear
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="mobileMenuToggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobileDropdown">
          <nav className="mobileNavLinks">
            <Link to="/" className={isActive('/') ? 'active' : ''} onClick={closeMobileMenu}>
              Home
            </Link>
            <Link to="/browse" className={isActive('/browse') ? 'active' : ''} onClick={closeMobileMenu}>
              Explore Wardrobe
            </Link>
            <Link to="/saved" className={isActive('/saved') ? 'active' : ''} onClick={closeMobileMenu}>
              ♡ Saved Pieces ({favoritesCount})
            </Link>
            <Link to="/how-it-works" className={isActive('/how-it-works') ? 'active' : ''} onClick={closeMobileMenu}>
              How It Works
            </Link>
            <Link to="/community" className={isActive('/community') ? 'active' : ''} onClick={closeMobileMenu}>
              Community
            </Link>
            <Link to="/additem" className={isActive('/additem') ? 'active' : ''} onClick={closeMobileMenu}>
              ＋ List a Piece
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className={isActive('/admin') ? 'active' : ''} onClick={closeMobileMenu}>
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="mobileNavAuth">
            {user ? (
              <div className="mobileUserRow">
                <Link to="/profile" className="mobileUserLink" onClick={closeMobileMenu}>
                  <img
                    className="mini"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                    alt={user.name}
                  />
                  <div>
                    <strong>{user.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>View Profile & Swaps</div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="btn btn-outline-sm"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="mobileAuthButtons">
                <Link to="/login" className="btn btn-ghost" onClick={closeMobileMenu} style={{ flex: 1, textAlign: 'center' }}>
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-dark-sm" onClick={closeMobileMenu} style={{ flex: 1, textAlign: 'center' }}>
                  Join ReWear
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;