import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTree, usePagesList, useCreatePage, useToggleFavorite, useUpdatePage } from '../../hooks/usePages';
import { PageNode } from './PageNode';

export const PageTree: React.FC = () => {
  const { id: activeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: treeNodes, isLoading: isTreeLoading } = usePageTree();
  const { data: favoritePages } = usePagesList({ is_favorite: true, is_archived: false });
  const { data: allPages } = usePagesList({ is_archived: false });

  // Mutations
  const createPageMutation = useCreatePage();
  const toggleFavoriteMutation = useToggleFavorite();
  const updatePageMutation = useUpdatePage();

  const handleSelectPage = (id: string) => {
    navigate(`/page/${id}`);
  };

  const handleCreateRootPage = async () => {
    try {
      const newPage = await createPageMutation.mutateAsync({
        title: 'Untitled',
        parent: null,
        content: '',
      });
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create root page:', error);
    }
  };

  const handleCreateChildPage = async (parentId: string) => {
    try {
      const newPage = await createPageMutation.mutateAsync({
        title: 'Untitled',
        parent: parentId,
        content: '',
      });
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create child page:', error);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavoriteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleMovePage = async (id: string, newParentId: string | null) => {
    try {
      await updatePageMutation.mutateAsync({
        id,
        data: { parent: newParentId },
      });
    } catch (error) {
      console.error('Failed to move page:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Favorites Section */}
      {favoritePages && favoritePages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 8px',
            marginBottom: '4px'
          }}>
            Favorites
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {favoritePages.map((page) => (
              <div
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: page.id === activeId ? 'var(--accent-color)' : 'var(--text-primary)',
                  backgroundColor: page.id === activeId ? 'var(--accent-light)' : 'transparent',
                  fontWeight: page.id === activeId ? 600 : 400,
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                <span style={{ marginRight: '6px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
                  {page.icon ? (
                    page.icon
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  )}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {page.title || 'Untitled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pages Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px'
        }}>
          <span>Private Pages</span>
          <button
            onClick={handleCreateRootPage}
            title="Create a new root page"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {isTreeLoading ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px', textAlign: 'center' }}>
            Loading tree...
          </div>
        ) : treeNodes && treeNodes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {treeNodes.map((node) => (
              <PageNode
                key={node.id}
                node={node}
                activeId={activeId}
                level={0}
                onSelect={handleSelectPage}
                onCreateChild={handleCreateChildPage}
                onToggleFavorite={handleToggleFavorite}
                allPages={allPages || []}
                onMove={handleMovePage}
              />
            ))}
          </div>
        ) : (
          <div style={{
            padding: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            borderRadius: '6px',
            margin: '0 8px',
            lineHeight: '1.4'
          }}>
            No pages yet.<br />
            Click the <strong style={{ color: 'var(--text-secondary)' }}>+</strong> button to create one.
          </div>
        )}
      </div>
    </div>
  );
};
export default PageTree;
