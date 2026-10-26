// ============================================================================
// ReWear — Signup / Join Page (src/pages/signup.jsx)
// Premium split-screen layout with sustainable fashion lifestyle photography
// ============================================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import signupLifestyleImg from '../assets/signup-lifestyle.jpg';

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, register, requestLogout, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [fromRedirect, setFromRedirect] = useState(false);

  // If redirected from login with email query param
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setFromRedirect(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUserExists(false);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
      return;
    }

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      location: location.trim() || 'Earth',
    });

    if (result.success) {
      navigate('/profile');
    } else {
      if (result.userExists) {
        setUserExists(true);
        setErrorMsg('An account with this email already exists.');
      } else {
        setErrorMsg(result.error || 'Registration failed. Please try again.');
      }
    }
  };

  // If already logged in, show status
  if (user) {
    return (
      <main className="page-container">
        <div className="auth" style={{ textAlign: 'center' }}>
          <div className="logo">
            re<span>wear</span>.
          </div>
          <h1 style={{ fontSize: '28px' }}>You're Already Registered</h1>
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
              onClick={() => requestLogout('/signup')}
              id="signup-page-logout-btn"
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
        {/* Left Side: Sustainable Fashion Lifestyle Image Banner */}
        <div className="authSplitHero">
          <img
            src={signupLifestyleImg}
            alt="Sustainable fashion conscious lifestyle"
            className="authSplitHeroImg"
          />
          <div className="authSplitHeroOverlay">
            <span className="authSplitHeroTag">CIRCULAR WARDROBE</span>
            <h2 className="authSplitHeroHeading">Swap, don’t shop.</h2>
            <p className="authSplitHeroSub">
              Discover authentic pieces, trade fairly with neighbors, and celebrate the garments you already own.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Registration Form Area */}
        <div className="authSplitFormArea">
          <div className="authSplitHeader">
            <Link to="/" className="logo">
              re<span>wear</span>.
            </Link>
            <h1 className="authSplitTitle">Join the swap.</h1>
            <p className="muted" style={{ margin: 0 }}>
              Create your sustainable wardrobe profile.
            </p>
          </div>

          {/* Redirect notice if sent from login */}
          {fromRedirect && !errorMsg && (
            <div className="auth-alert auth-alert-notice">
              🌱 <strong>Welcome!</strong> No account was found with that email, so let's set you up with one below.
            </div>
          )}

          {/* Error: User already exists -> direct to login */}
          {userExists && (
            <div className="auth-alert auth-alert-redirect">
              <b>Account Already Exists!</b>
              <p style={{ margin: '4px 0 8px' }}>
                An account with email <strong>{email}</strong> already exists.
              </p>
              <button
                type="button"
                className="auth-btn-direct"
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
              >
                Log In to Your Account &rarr;
              </button>
            </div>
          )}

          {/* General Error Notice */}
          {errorMsg && !userExists && (
            <div className="auth-alert auth-alert-error">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="signup-name">FULL NAME</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="e.g. Jordan Hayes"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-email">EMAIL</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (userExists) setUserExists(false);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-password">PASSWORD</label>
              <div className="auth-field-row">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  autoComplete="new-password"
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

            <div className="field">
              <label htmlFor="signup-confirm-password">CONFIRM PASSWORD</label>
              <div className="auth-field-row">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="signup-location">LOCATION</label>
              <input
                id="signup-location"
                name="location"
                type="text"
                placeholder="e.g. Ahmedabad, Gujarat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="address-level2"
              />
            </div>

            <button
              type="submit"
              className="btn dark"
              style={{ width: '100%', marginTop: '16px', padding: '14px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="muted" style={{ marginTop: '24px', fontSize: '13.5px' }}>
            Already have an account?{' '}
            <Link
              to={email ? `/login?email=${encodeURIComponent(email)}` : '/login'}
              className="auth-link"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Signup;