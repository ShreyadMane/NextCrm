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
    <main className="crm-login-page">
      <section className="crm-login-panel">
        <div className="crm-login-form-wrap">
          <AppLogo size="lg" className="login-app-logo" />

          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">to access NexCRM</p>

          <form className="crm-login-form" onSubmit={handleSubmit}>
            <div className="login-account-row">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
              <button type="button" onClick={() => setEmail('')}>Change</button>
            </div>

            <div className="login-password-row">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.9 10.9 0 0112 20C7 20 2.73 16.89 1 12a18.4 18.4 0 014.06-5.94"/><path d="M9.9 4.24A10.8 10.8 0 0112 4c5 0 9.27 3.11 11 8a18.5 18.5 0 01-2.16 3.19"/><path d="M14.12 14.12A3 3 0 019.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            <div className="forgot-row">
              <button type="button">Forgot password?</button>
            </div>

            <button className="login-primary-button" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                  Signing in
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </section>

      <section className="crm-login-visual" aria-label="CRM workflow overview">
        <SecurityIllustration />
        <h2>Customer work, organized</h2>
        <p>Track leads, deals, meetings, calls, and support conversations from one connected CRM workspace.</p>
        <button type="button" className="learn-more-button">Explore workflow</button>
        <div className="login-slider-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}

function SecurityIllustration() {
  return (
    <div className="security-illustration">
      <svg viewBox="0 0 430 280" role="img" aria-label="Secure CRM login illustration">
        <defs>
          <linearGradient id="panelGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        <path className="illustration-cloud" d="M86 218c-29 0-54-24-54-54 0-28 22-51 50-54 12-34 45-58 84-58 42 0 78 28 88 66 9-5 20-8 32-8 34 0 62 28 62 62s-28 46-62 46H86z" />

        <g className="social-bubble bubble-twitter">
          <circle cx="103" cy="48" r="24" />
          <path d="M94 48c8 1 15-2 20-9-1 6-4 11-9 14-4 3-10 4-16 2 4 0 8-2 11-5-4 0-7-3-8-6 1 1 2 1 4 1-4-2-7-5-7-10 2 1 4 2 6 2-3-2-4-5-4-9 7 8 15 12 25 13-2-7 4-13 10-13 4 0 7 2 9 4 3-1 5-2 8-3-1 3-3 5-5 6 2 0 5-1 7-2-2 3-4 5-7 7v2c0 17-13 36-36 36-7 0-13-2-18-5 6 1 13-1 18-4-5 0-9-3-11-8 2 0 4 0 6-1z" />
        </g>

        <g className="social-bubble bubble-calendar">
          <circle cx="164" cy="66" r="20" />
          <rect x="154" y="58" width="20" height="18" rx="3" />
          <path d="M154 63h20M159 54v7M169 54v7" />
        </g>

        <g className="social-bubble bubble-contact">
          <circle cx="285" cy="38" r="25" />
          <circle cx="285" cy="34" r="7" />
          <path d="M272 51c3-7 8-10 13-10s10 3 13 10" />
        </g>

        <g className="social-bubble bubble-google">
          <circle cx="355" cy="86" r="23" />
          <path d="M365 86h-11M368 86c0 8-6 14-14 14s-15-6-15-15 7-15 15-15c4 0 8 2 11 5" />
        </g>

        <g className="person">
          <path d="M129 121c-11 12-18 27-20 45l20 2c4-16 10-28 19-37z" />
          <path d="M150 90c-14 6-20 21-15 35 5 14 19 20 34 15 14-5 21-20 16-34-5-14-20-22-35-16z" />
          <path d="M166 127c-4 11-14 18-26 18l-13 80h65l-11-75c16-2 28-12 36-29l-18-9c-8 13-18 18-33 15z" />
          <path d="M147 230l-14 35h22l18-35zM181 230l22 35h22l-18-35z" />
        </g>

        <g className="secure-card">
          <rect x="182" y="83" width="138" height="142" rx="15" fill="url(#panelGradient)" />
          <rect x="204" y="108" width="75" height="8" rx="4" />
          <rect x="204" y="128" width="92" height="8" rx="4" />
          <circle cx="251" cy="169" r="31" fill="none" />
          <path d="M238 169a13 13 0 1013-13v13l9-9" />
          <path d="M251 140v10M251 188v10M280 169h-10M232 169h-10" />
        </g>

        <g className="password-card">
          <rect x="284" y="120" width="96" height="60" rx="10" />
          <path d="M302 140h50M302 158h60" />
          <path d="M302 140h6M316 140h6M330 140h6M344 140h6" />
          <circle cx="365" cy="146" r="8" />
          <path d="M361 146h8" />
        </g>

        <g className="sync-badge">
          <circle cx="305" cy="207" r="22" />
          <path d="M297 203a10 10 0 0116-6l4 4M313 211a10 10 0 01-16 6l-4-4" />
          <path d="M318 195v8h-8M292 221v-8h8" />
        </g>

        <path className="accent-line" d="M179 231h89" />
      </svg>
    </div>
  );
}
