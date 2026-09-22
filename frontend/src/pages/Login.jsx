import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Shield, Wrench, Package, ArrowRight,
  Lock, Mail, AlertCircle, Eye, EyeOff,
  Cpu, FlaskConical, MonitorSmartphone, ScanBarcode
} from 'lucide-react';

/* ───────────────────────────────────────────────
   Inline styles – keeps the component self-contained
   ─────────────────────────────────────────────── */

const styles = {
  /* ---------- page wrapper ---------- */
  page: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },

  /* ---------- LEFT column ---------- */
  left: {
    flex: '1 1 50%',
    background: 'linear-gradient(160deg, #0b1120 0%, #111d3a 40%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 20% 30%, rgba(37,99,235,0.18) 0%, transparent 55%),' +
      'radial-gradient(circle at 80% 70%, rgba(99,102,241,0.14) 0%, transparent 55%)',
    pointerEvents: 'none',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.75rem',
    boxShadow: '0 12px 32px rgba(37,99,235,0.35)',
    position: 'relative',
    zIndex: 1,
  },
  leftTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 1.25,
    position: 'relative',
    zIndex: 1,
  },
  leftTagline: {
    fontSize: '1rem',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: '0.75rem',
    maxWidth: 340,
    lineHeight: 1.6,
    position: 'relative',
    zIndex: 1,
  },
  featureRow: {
    display: 'flex',
    gap: '2rem',
    marginTop: '3rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.45rem',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#60a5fa',
  },
  featureLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },

  /* ---------- RIGHT column ---------- */
  right: {
    flex: '1 1 50%',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
  },
  formHeading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '0.25rem',
  },
  formSub: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '2rem',
  },

  /* error banner */
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.12)',
    border: '1px solid rgba(248,113,113,0.3)',
    color: '#fca5a5',
    padding: '0.75rem 0.85rem',
    borderRadius: 10,
    fontSize: '0.8rem',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  /* labels */
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '0.4rem',
  },

  /* input wrapper */
  inputWrap: {
    position: 'relative',
    marginBottom: '1.15rem',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#475569',
    pointerEvents: 'none',
    display: 'flex',
  },
  input: {
    width: '100%',
    padding: '0.72rem 0.85rem 0.72rem 2.6rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#475569',
    display: 'flex',
    padding: 4,
  },

  /* sign-in button */
  submitBtn: {
    width: '100%',
    padding: '0.78rem',
    background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: '0.92rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
    transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
    boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
  },

  /* demo section */
  demoDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: '2rem 0 1.25rem',
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    background: '#1e293b',
  },
  demoDividerText: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    whiteSpace: 'nowrap',
  },
  demoBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.9rem',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    marginBottom: '0.5rem',
  },
  demoBtnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
  },
  demoBtnName: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  demoBtnEmail: {
    fontSize: '0.72rem',
    color: '#64748b',
  },

  /* ---------- responsive mobile: stack columns ---------- */
  mobileLeft: {
    display: 'none',
  },
};

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */

export const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoverSubmit, setHoverSubmit] = useState(false);
  const [hoverDemo, setHoverDemo] = useState(null);

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const demoAccounts = [
    { label: 'Administrator', email: 'admin@college.edu', pass: 'Admin@123', icon: <Shield size={17} />, color: '#a78bfa' },
    { label: 'Lab Staff',     email: 'staff@college.edu', pass: 'Staff@123', icon: <Wrench size={17} />,  color: '#60a5fa' },
    { label: 'Store In-Charge', email: 'store@college.edu', pass: 'Store@123', icon: <Package size={17} />, color: '#fbbf24' },
  ];

  return (
    <>
      {/* Responsive CSS injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .login-page { display: flex; min-height: 100vh; }
        .login-left  { flex: 1 1 50%; }
        .login-right { flex: 1 1 50%; }

        .login-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.25) !important;
        }

        .login-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(37,99,235,0.45);
        }
        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-submit:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }

        .demo-btn:hover {
          border-color: #3b82f6 !important;
          background-color: rgba(37,99,235,0.08) !important;
        }
        .demo-btn:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
        }

        .eye-toggle:hover { color: #94a3b8 !important; }
        .eye-toggle:focus-visible {
          outline: 2px solid #60a5fa;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* ---- mobile ---- */
        @media (max-width: 860px) {
          .login-page  { flex-direction: column; }
          .login-left  { flex: none; padding: 2rem 1.5rem !important; }
          .login-right { flex: none; padding: 2rem 1.5rem !important; }
          .left-features { display: none !important; }
          .left-title  { font-size: 1.4rem !important; }
          .left-tagline { font-size: 0.85rem !important; margin-top: 0.4rem !important; }
        }
      `}</style>

      <div className="login-page" style={styles.page}>
        {/* ═══════════════════════ LEFT PANEL ═══════════════════════ */}
        <div className="login-left" style={styles.left}>
          {/* decorative overlays */}
          <div style={styles.leftOverlay} />
          <div style={styles.gridBg} />

          <div style={styles.logoBox}>
            <Building2 size={32} color="#fff" />
          </div>

          <h1 className="left-title" style={styles.leftTitle}>
            Smart Inventory<br />&amp; Asset System
          </h1>
          <p className="left-tagline" style={styles.leftTagline}>
            Seamless Tracking for College Labs &amp; Equipment
          </p>

          {/* mini feature icons */}
          <div className="left-features" style={styles.featureRow}>
            {[
              { icon: <Cpu size={18} />,               label: 'Asset Tracking' },
              { icon: <FlaskConical size={18} />,      label: 'Lab Inventory' },
              { icon: <ScanBarcode size={18} />,       label: 'QR Scanning' },
              { icon: <MonitorSmartphone size={18} />, label: 'Real-time Reports' },
            ].map((f) => (
              <div key={f.label} style={styles.featureItem}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <span style={styles.featureLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════ RIGHT PANEL ═══════════════════════ */}
        <div className="login-right" style={styles.right}>
          <div style={styles.formCard}>
            <h2 style={styles.formHeading}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your institutional account</p>

            {/* error banner */}
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* ---- form ---- */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label style={styles.label}>Institutional Email Address</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}><Mail size={16} /></span>
                  <input
                    className="login-input"
                    type="email"
                    required
                    placeholder="e.g. admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}><Lock size={16} /></span>
                  <input
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...styles.input, paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit"
                style={styles.submitBtn}
              >
                <span>{loading ? 'Authenticating…' : 'Sign In to Portal'}</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* ---- demo accounts ---- */}
            <div style={styles.demoDivider}>
              <div style={styles.demoDividerLine} />
              <span style={styles.demoDividerText}>Quick 1-Click Demo Accounts</span>
              <div style={styles.demoDividerLine} />
            </div>

            {demoAccounts.map((d) => (
              <button
                key={d.email}
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin(d.email, d.pass)}
                style={styles.demoBtn}
              >
                <div style={styles.demoBtnLeft}>
                  <span style={{ color: d.color, display: 'flex' }}>{d.icon}</span>
                  <span style={styles.demoBtnName}>{d.label}</span>
                </div>
                <span style={styles.demoBtnEmail}>{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
