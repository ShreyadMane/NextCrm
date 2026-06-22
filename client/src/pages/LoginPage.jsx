import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="login-split-page">
      <div className="login-split-left">
        <div className="login-logo" style={{ position: 'absolute', top: 40, left: 40 }}>
          <div className="logo-icon">N</div>
          <div className="logo-text">NexCRM</div>
        </div>

        <div className="login-form-container">
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.03em' }}>Welcome back</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Log in to your account to continue managing your pipeline.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontSize: 13 }}>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ padding: '14px 16px', fontSize: 15, borderRadius: 12 }}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontSize: 13 }}>Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ padding: '14px 16px', fontSize: 15, borderRadius: 12 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div 
                  className={`checkbox-custom ${rememberMe ? 'checked' : ''}`} 
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{ borderRadius: 6, width: 20, height: 20 }}
                >
                  {rememberMe && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Remember me</span>
              </label>
              <a href="#" style={{ fontSize: 14, color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: '12px', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)' }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }}></span> Signing in...</>
              ) : 'Sign in to your account'}
            </button>
          </form>
        </div>
      </div>

      <div className="login-split-right" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Animated Background Shapes */}
        <div style={{ 
          position: 'absolute', right: -50, bottom: -50, width: 500, height: 500, 
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)', 
          filter: 'blur(40px)', animation: 'float-slow 8s ease-in-out infinite alternate' 
        }}></div>
        <div style={{ 
          position: 'absolute', left: -100, top: 100, width: 400, height: 400, 
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', 
          filter: 'blur(30px)', animation: 'float-medium 6s ease-in-out infinite alternate-reverse' 
        }}></div>
        <div style={{ 
          position: 'absolute', right: 200, top: -150, width: 600, height: 600, 
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', 
          filter: 'blur(50px)', animation: 'float-fast 10s ease-in-out infinite alternate' 
        }}></div>

        <div style={{ maxWidth: 520, margin: 'auto 0 auto 10%', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            Drive revenue with clarity.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9, marginBottom: 40, fontWeight: 400 }}>
            NexCRM gives your team the visibility and speed they need to close deals faster and build stronger relationships.
          </p>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)', 
            padding: '32px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }}>
            <p style={{ fontSize: 16, fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>
              "Switching to NexCRM was the best decision for our sales team. We increased our close rate by 40% in the first quarter."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                A
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Alex Morgan</div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>VP of Sales, TechFlow</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float-medium {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 30px) scale(1.1); }
        }
        @keyframes float-fast {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(5deg) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
