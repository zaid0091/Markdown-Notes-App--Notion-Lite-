import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../../api/client';
import { ThemeToggle } from '../common/ThemeToggle';
import BrandLogo from '../common/BrandLogo';
import { PageTree } from '../sidebar/PageTree';
import { SearchPalette } from '../search/SearchPalette';
import LoadingScreen from '../common/LoadingScreen';

export const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isRestoringSession } = useAuth();
  const navigate = useNavigate();

  if (isRestoringSession) {
    return <LoadingScreen />;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        borderRight: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-sidebar)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}>
        <div>
          {/* Header block with Title & ThemeToggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              <Link to="/">
                <BrandLogo size={38} withBackground={true} />
              </Link>
            </div>
            <ThemeToggle />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(123, 31, 162, 0.2)',
              overflow: 'hidden',
            }}>
              {user?.profile_picture ? (
                <img 
                  src={getAssetUrl(user.profile_picture)} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
              ) : (
                user?.username ? user.username.slice(0, 2).toUpperCase() : 'NL'
              )}
            </div>
            <span>Workspace: <strong>{user?.username}</strong></span>
          </div>

          {/* Quick Navigation Links */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px'
          }}>
            <button
              onClick={() => navigate('/workspace')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                width: '100%',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Workspace Hub</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                width: '100%',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-light)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Account Settings</span>
            </button>
          </div>
          
          {/* Sidebar Navigation containing Collapsible Page Tree */}
          <nav id="sidebar-nav-container" style={{
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            marginRight: '-10px',
            paddingRight: '10px'
          }}>
            <PageTree />
          </nav>
        </div>
        
        {/* Logout button */}
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: '1px solid #ef5350',
            color: '#ef5350',
            padding: '10px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            textAlign: 'center',
            transition: 'background-color 0.2s, color 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ef5350';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ef5350';
          }}
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {children}
      </div>

      {/* Global Omnibar Search Overlay */}
      <SearchPalette />
    </div>
  );
};
export default WorkspaceLayout;
