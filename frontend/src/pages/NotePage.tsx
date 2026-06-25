import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageDetails } from '../hooks/usePages';

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  
  // Retrieve page details if an ID is present in the route params
  const { data: page, isLoading } = usePageDetails(id);

  if (isLoading && id) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#181a1b',
        color: '#ccc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading note details...</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      height: '100vh',
      backgroundColor: '#181a1b',
      color: '#e8e6e3',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar Grid Area */}
      <aside style={{
        borderRight: '1px solid #2d3134',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#1c1e20'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '24px', color: '#fff' }}>
            Notion Lite
          </div>
          <div style={{ fontSize: '0.9rem', color: '#a8a095', marginBottom: '16px' }}>
            Workspace: <strong>{user?.username}</strong>
          </div>
          
          {/* Sidebar Navigation placeholder for tree structures */}
          <nav>
            <div style={{
              padding: '12px 16px',
              fontSize: '0.85rem',
              color: '#7a828a',
              border: '1px dashed #2d3134',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              [Sidebar Navigator Placeholder]
            </div>
          </nav>
        </div>
        
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
            transition: 'background-color 0.2s, color 0.2s'
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

      {/* Main Canvas Editor Area */}
      <main style={{
        padding: '40px 60px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {id ? (
          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              {page?.title || 'Untitled'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7a828a', marginBottom: '24px' }}>
              Last updated: {page ? new Date(page.updated_at).toLocaleString() : ''}
            </div>
            <div style={{
              lineHeight: 1.7,
              color: '#d1cdc7',
              backgroundColor: '#1f2224',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #2d3134',
              whiteSpace: 'pre-wrap'
            }}>
              {page?.content || 'No content yet.'}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7a828a',
            gap: '12px'
          }}>
            <h2 style={{ color: '#fff', margin: 0 }}>Welcome to Notion Lite, {user?.username}!</h2>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Select a note from the sidebar or create a new one to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotePage;
