import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageDetails } from '../hooks/usePages';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Retrieve page details if an ID is present in the route params
  const { data: page, isLoading } = usePageDetails(id);

  if (isLoading && id) {
    return (
      <WorkspaceLayout>
        <div style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Loading note details...</div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      {/* Main Canvas Editor Area */}
      <main style={{
        padding: '40px 60px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}>
        {id ? (
          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {page?.title || 'Untitled'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Last updated: {page ? new Date(page.updated_at).toLocaleString() : ''}
            </div>
            <div style={{
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-wrap',
              transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
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
            color: 'var(--text-muted)',
            gap: '12px'
          }}>
            <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Welcome to Notion Lite, {user?.username}!</h2>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Select a note from the sidebar or create a new one to get started.
            </p>
          </div>
        )}
      </main>
    </WorkspaceLayout>
  );
};

export default NotePage;
