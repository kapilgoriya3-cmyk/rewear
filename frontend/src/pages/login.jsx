// ============================================================================
// ReWear — Login Page (src/pages/login.jsx)
// Premium split-screen layout with curated sustainable fashion photography
// ============================================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authWardrobeImg from '../assets/auth-wardrobe.jpg';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, logout, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Pre-fill email if passed in query param (e.g. ?email=user@example.com)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Handle countdown if account is not found
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown <= 0) {
      navigate(`/signup?email=${encodeURIComponent(email)}`);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUserNotFound(false);
    setRedirectCountdown(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const result = await login(email.trim(), password);

    if (result.success) {
      navigate('/profile');
    } else {
      if (result.userNotFound) {
        setUserNotFound(true);
        setErrorMsg(`No account found for "${email}". You need to register first!`);
        // Start automatic redirection countdown
        setRedirectCountdown(4);
      } else {
        setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleCancelCountdown = () => {
    setRedirectCountdown(null);
  };

  const handleDirectToCreateAccount = () => {
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  // If already logged in, show status
  if (user) {
    return (
      <main className="page-container">
        <div className="auth" style={{ textAlign: 'center' }}>
          <div className="logo">
            re<span>wear</span>.
          </div>
          <h1 style={{ fontSize: '28px' }}>Already Logged In</h1>
          <p className="muted">
            You are signed in as <strong>{user.name}</strong> ({user.email})
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn green"
              style={{ flex: 1 }}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </button>
            <button
              type="button"
              className="btn light"
              style={{ flex: 1 }}
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="authSplitLayout">
        {/* Left Side: Sustainable Fashion Wardrobe Image Banner */}
        <div className="authSplitHero">
          <img
            src={authWardrobeImg}
            alt="Curated minimalist sustainable wardrobe rack"
            className="authSplitHeroImg"
          />
          <div className="authSplitHeroOverlay">
            <span className="authSplitHeroTag">CONSCIOUS CIRCULATION</span>
            <h2 className="authSplitHeroHeading">Wear less new.<br />Swap more.</h2>
            <p className="authSplitHeroSub">
              Join thousands of community members keeping quality garments in circulation. Fair value, zero waste.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Authentication Form */}
        <div className="authSplitFormArea">
          <div className="authSplitHeader">
            <Link to="/" className="logo">
              re<span>wear</span>.
            </Link>
            <h1 className="authSplitTitle">Welcome back.</h1>
            <p className="muted" style={{ margin: 0 }}>
              Your wardrobe is waiting.
            </p>
          </div>

          {/* Account Not Found Notice with Direct Redirection */}
          {userNotFound && (
            <div className="auth-alert auth-alert-redirect">
              <b>Account Not Found!</b>
              <p style={{ margin: '4px 0 8px' }}>
                We could not find an account for <strong>{email}</strong>. Please create an account to start swapping.
              </p>
              {redirectCountdown !== null && (
                <p style={{ fontSize: '12px', margin: '4px 0 10px', color: '#8c5000' }}>
                  Redirecting you to Create Account in <strong>{redirectCountdown}</strong>s...
                  {' '}
                  <button
                    type="button"
                    onClick={handleCancelCountdown}
                    style={{
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      color: 'inherit',
                      padding: 0,
                      cursor: 'pointer',
                      fontWeight: 750
                    }}
                  >
                    Cancel
                  </button>
                </p>
              )}
              <button
                type="button"
                className="auth-btn-direct"
                onClick={handleDirectToCreateAccount}
              >
                Create an Account Now &rarr;
              </button>
            </div>
          )}

          {/* General Error Notice */}
          {errorMsg && !userNotFound && (
            <div className="auth-alert auth-alert-error">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">EMAIL</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (userNotFound) setUserNotFound(false);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">PASSWORD</label>
              <div className="auth-field-row">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn dark"
              style={{ width: '100%', marginTop: '16px', padding: '14px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="muted" style={{ marginTop: '24px', fontSize: '13.5px' }}>
            Don't have an account?{' '}
            <Link
              to={email ? `/signup?email=${encodeURIComponent(email)}` : '/signup'}
              className="auth-link"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;