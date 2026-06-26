import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import { getAssetUrl } from '../../api/client';
import '../../styles/landing.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'NL';

  return (
    <header className="landing-nav">
      <a 
        href="/" 
        className="landing-logo"
        onClick={(e) => { e.preventDefault(); navigate('/'); }}
      >
        <BrandLogo size={38} />
      </a>

      <div className="landing-nav-actions">
        <a 
          href="/docs" 
          className="landing-nav-link"
          onClick={(e) => { e.preventDefault(); navigate('/docs'); }}
          style={{ 
            marginRight: '16px', 
            color: 'var(--text-secondary)', 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Docs
        </a>
        <ThemeToggle />
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <div
                onClick={() => navigate('/profile')}
                title="View Account Settings"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(123, 31, 162, 0.2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 6px 15px rgba(123, 31, 162, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(123, 31, 162, 0.2)';
                }}
              >
                {user.profile_picture ? (
                  <img 
                    src={getAssetUrl(user.profile_picture)} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                  />
                ) : (
                  userInitials
                )}
              </div>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/workspace')}>
              Go to Workspace
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '6px', verticalAlign: 'middle' }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
