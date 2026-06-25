import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';

export const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading session...</div>
      </div>
    );
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
            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              Notion Lite
            </div>
            <ThemeToggle />
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Workspace: <strong>{user?.username}</strong>
          </div>
          
          {/* Sidebar Navigation Placeholder */}
          <nav id="sidebar-nav-container">
            {/* Will contain collapsible page tree in next phases */}
            <div style={{
              padding: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              [Sidebar Navigator]
            </div>
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
    </div>
  );
};
export default WorkspaceLayout;
