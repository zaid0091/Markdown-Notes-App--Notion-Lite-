import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageDetails } from '../hooks/usePages';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import { PageHeader } from '../components/editor/PageHeader';
import { EditorPane } from '../components/editor/EditorPane';
import { PreviewPane } from '../components/editor/PreviewPane';

export const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Retrieve page details if an ID is present in the route params
  const { data: page, isLoading } = usePageDetails(id);

  const [draftContent, setDraftContent] = useState('');
  const [prevPageId, setPrevPageId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');

  // Update document title dynamically based on selected note
  useEffect(() => {
    if (id && page) {
      document.title = `${page.title || 'Untitled'} | Notion Lite`;
    } else {
      document.title = "Workspace | Notion Lite";
    }
  }, [id, page]);

  // Sync draftContent state with prop page.content synchronously on load or page navigation
  if (page && page.id !== prevPageId) {
    setDraftContent(page.content);
    setPrevPageId(page.id);
  }

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

  const hasCover = page ? !!page.cover_image : false;

  return (
    <WorkspaceLayout>
      {id && page ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }}>
          {/* Note Canvas Scrollable Header Wrapper */}
          <div style={{ overflowY: 'auto', flexShrink: 0 }}>
            <PageHeader page={page} />

            {/* Positioned Action Options Toolbar (aligned with PageHeader coordinates) */}
            <div style={{
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
              padding: '0 54px',
              position: 'relative',
            }}>
              {/* View Mode Toggle Buttons Capsule */}
              <div style={{
                position: 'absolute',
                top: hasCover ? '-15px' : '10px',
                right: '110px',
                display: 'flex',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '2px',
                zIndex: 10,
              }}>
                {(['edit', 'split', 'preview'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      background: viewMode === mode ? 'var(--bg-primary)' : 'transparent',
                      color: viewMode === mode ? 'var(--accent-color)' : 'var(--text-muted)',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'background 0.25s, color 0.25s',
                      boxShadow: viewMode === mode ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Split Pane Canvas Editor & Preview Area */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
            flexGrow: 1,
            height: '0', // enables internal scrolling on children
            overflow: 'hidden',
            borderTop: '1px solid var(--border-color)',
            marginTop: '20px',
          }}>
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div style={{
                height: '100%',
                overflow: 'hidden',
                borderRight: viewMode === 'split' ? '1px solid var(--border-color)' : 'none',
              }}>
                <EditorPane page={page} onChange={setDraftContent} />
              </div>
            )}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div style={{
                height: '100%',
                overflow: 'hidden',
              }}>
                <PreviewPane content={draftContent} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Note State Dashboard */
        <main style={{
          padding: '40px 60px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}>
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
        </main>
      )}
    </WorkspaceLayout>
  );
};

export default NotePage;
