import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { useToast } from '../components/Toast';
import AppLogo from '../components/AppLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { status } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (result.error) {
      toast.error(result.error.message || 'Login failed. Please check your credentials.');
    } else {
      toast.success('Successfully logged in');
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      {/* Top navigation */}
      <nav className="login-navbar">
        <AppLogo size="md" className="login-logo" />
        <div className="login-nav-links">
          <a href="#product">Product</a>
          <a href="#resources">Resources</a>
          <a href="#pricing">Pricing</a>
        </div>
      </nav>

      {/* Main content */}
      <main className="login-main">
        {/* Left side — Form */}
        <section className="login-form-section">
          <div className="login-form-inner">
            <h1 className="login-heading">Sign in</h1>
            <p className="login-subheading">Welcome back to your workspace</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">EMAIL ADDRESS</label>
                <div className="login-input-row">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                  <button type="button" className="login-change-btn" onClick={() => setEmail('')}>Change</button>
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">PASSWORD</label>
                <div className="login-input-row">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="login-forgot-row">
                <a href="#forgot" className="login-forgot-link">Forgot password?</a>
              </div>

              <button className="login-submit-btn" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in to NexCRM
                    <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <p className="login-signup-text">
              Don't have an account? <a href="#signup" className="login-signup-link">Get started for free</a>
            </p>

            <div className="login-trusted">
              <span className="login-trusted-label">TRUSTED BY TEAMS AT</span>
              <div className="login-trusted-logos">
                <span>Vercel</span>
                <span>Linear</span>
                <span>Stripe</span>
                <span>Revolut</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right side — Hero image + testimonial */}
        <section className="login-hero-section">
          <div className="login-hero-image">
            <div className="login-hero-gradient" />
            {/* Testimonial card */}
            <div className="login-testimonial">
              <div className="login-testimonial-stars">
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
              </div>
              <blockquote className="login-testimonial-quote">
                "The most CRM we've ever used. It feels like it was built for us, not for data."
              </blockquote>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="login-footer-left">
          <strong>NexCRM</strong>
          <span>© 2026 NexCRM Inc.</span>
        </div>
        <div className="login-footer-right">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#support">Support</a>
        </div>
      </footer>
    </div>
  );
}
