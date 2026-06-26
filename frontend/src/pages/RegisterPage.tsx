import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import BrandLogo from '../components/common/BrandLogo';
import '../styles/auth.css';

interface RegisterErrorResponse {
  username?: string[];
  email?: string[];
  password?: string[];
  non_field_errors?: string[];
  detail?: string;
}

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  // Password strength requirements
  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumberOrSymbol = /[\d\W]/.test(password);

  const getStrengthScore = () => {
    if (!password) return 0;
    let score = 0;
    if (isLengthValid) score++;
    if (hasUppercase) score++;
    if (hasNumberOrSymbol) score++;
    return score;
  };

  const getStrengthTextAndClass = () => {
    const score = getStrengthScore();
    if (score === 0) return { text: '', className: '' };
    if (score === 1) return { text: 'Weak', className: 'weak' };
    if (score === 2) return { text: 'Medium', className: 'medium' };
    return { text: 'Strong', className: 'strong' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (getStrengthScore() < 2) {
      setError('Please choose a stronger password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register User
      await register(username, email, password);
      // 2. Auto login
      await login(email, password);
      navigate('/workspace');
    } catch (err) {
      const errorWithResponse = err as { response?: { data?: RegisterErrorResponse } };
      const responseData = errorWithResponse.response?.data;
      
      let errMessage = 'Registration failed. Please check inputs.';
      if (responseData) {
        if (responseData.username) {
          errMessage = `Username error: ${responseData.username.join(' ')}`;
        } else if (responseData.email) {
          errMessage = `Email error: ${responseData.email.join(' ')}`;
        } else if (responseData.password) {
          errMessage = `Password error: ${responseData.password.join(' ')}`;
        } else if (responseData.non_field_errors) {
          errMessage = responseData.non_field_errors.join(' ');
        } else if (responseData.detail) {
          errMessage = responseData.detail;
        }
      }
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (platform: string) => {
    alert(`${platform} authentication is currently mocked in the frontend.`);
  };

  const strengthInfo = getStrengthTextAndClass();

  return (
    <div className="auth-container">
      {/* Floating Theme Switcher */}
      <div className="auth-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="auth-split-layout">
        {/* Left Side: Form */}
        <div className="auth-form-side">
          <div className="auth-card animate-slide-up" style={{ padding: '28px 36px' }}>
            <div className="auth-header" style={{ marginBottom: '20px' }}>
              <div className="auth-logo-row">
                <div className="auth-logo-icon">
                  <BrandLogo size={18} />
                </div>
                <span className="auth-logo-text">Notion Lite</span>
              </div>
              <p className="auth-subtitle">Create your personal markdown workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '14px' }}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="username-input">
                  Username
                </label>
                <div className="input-wrapper">
                  <input
                    id="username-input"
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. johndoe"
                  />
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email-input">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    id="email-input"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                  />
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 8 characters"
                  />
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Widget */}
                {password && (
                  <div className="password-strength-container animate-fade-in">
                    <div className="strength-bar-wrapper">
                      <div className={`strength-bar ${strengthInfo.className}`}></div>
                    </div>
                    <div className="strength-text">
                      Password strength: <span className={strengthInfo.className}>{strengthInfo.text}</span>
                    </div>
                    <div className="strength-rules">
                      <div className={`rule-item ${isLengthValid ? 'valid' : ''}`}>
                        <div className="rule-icon">
                          {isLengthValid ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`rule-item ${hasUppercase ? 'valid' : ''}`}>
                        <div className="rule-icon">
                          {hasUppercase ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`rule-item ${hasNumberOrSymbol ? 'valid' : ''}`}>
                        <div className="rule-icon">
                          {hasNumberOrSymbol ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                        <span>At least 1 number or special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password-input">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="confirm-password-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                  />
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Social Logins */}
            <div className="social-auth-section" style={{ marginTop: '14px' }}>
              <div className="social-divider">Or sign up with</div>
              <div className="social-buttons-grid">
                <button type="button" className="social-btn" onClick={() => handleSocialClick('Google')} title="Sign up with Google">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialClick('GitHub')} title="Sign up with GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialClick('Apple')} title="Sign up with Apple">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="auth-showcase-side">
          <div className="auth-grid-bg"></div>
          <div className="auth-glow-orb-1"></div>
          <div className="auth-glow-orb-2"></div>

          {/* Floating Workspace Preview */}
          <div className="showcase-preview-card">
            <div className="showcase-header">
              <span className="showcase-dot red"></span>
              <span className="showcase-dot yellow"></span>
              <span className="showcase-dot green"></span>
              <span className="showcase-title">workspace / project_notes.md</span>
            </div>
            <div className="showcase-body">
              <h3>🚀 Welcome to Notion Lite!</h3>
              <p>Type markdown on the left, watch it compile instantly on the right.</p>
              <p>Scientific equations render in high quality:</p>
              <code>e^(i*π) + 1 = 0</code>
            </div>
          </div>

          {/* Showcase Features List */}
          <div className="showcase-feature-list">
            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="showcase-feature-info">
                <h4>Hierarchical Folders</h4>
                <p>Organize markdown documents in a clean nested page tree.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
              </div>
              <div className="showcase-feature-info">
                <h4>LaTeX & Math Compiles</h4>
                <p>Advanced typesetting and formulas render inline automatically.</p>
              </div>
            </div>

            <div className="showcase-feature-item">
              <div className="showcase-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </div>
              <div className="showcase-feature-info">
                <h4>Automatic Backup & Sync</h4>
                <p>Every keystroke is saved immediately to prevent any work loss.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
