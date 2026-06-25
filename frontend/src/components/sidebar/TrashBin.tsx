import React, { useState, useEffect, useRef } from 'react';
import { usePagesList, useRestorePage, useDeletePage } from '../../hooks/usePages';
import type { Page } from '../../types';

interface TrashBinProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const TrashBin: React.FC<TrashBinProps> = ({ isOpen, onClose, triggerRef }) => {
  const { data: archivedPages = [], isLoading } = usePagesList({ is_archived: true });
  const restorePageMutation = useRestorePage();
  const deletePageMutation = useDeletePage();

  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync state during render to avoid cascading renders
  if (isOpen !== prevIsOpen) {
    if (!isOpen) {
      setSearchQuery('');
    }
    setPrevIsOpen(isOpen);
  }


  if (!isOpen) return null;

  const filteredPages = archivedPages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restorePageMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to restore page:', err);
    }
  };

  const handleDeletePermanently = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this page and all of its descendants? This action cannot be undone.')) {
      return;
    }
    try {
      await deletePageMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete page permanently:', err);
    }
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '270px',
        zIndex: 500,
        width: '280px',
        maxHeight: '350px',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
      }}
      data-testid="trash-bin-popover"
    >
      {/* Popover Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Trash Bin</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '2px',
          }}
          title="Close Trash"
        >
          ✕
        </button>
      </div>

      {/* Popover Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by title..."
          style={{
            width: '100%',
            padding: '6px 10px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
          autoFocus
        />
      </div>

      {/* Pages List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {isLoading ? (
          <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Loading archived pages...
          </div>
        ) : filteredPages.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No pages found
          </div>
        ) : (
          filteredPages.map((page: Page) => (
            <div
              key={page.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                const btns = e.currentTarget.querySelector('.trash-actions') as HTMLElement;
                if (btns) btns.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                const btns = e.currentTarget.querySelector('.trash-actions') as HTMLElement;
                if (btns) btns.style.opacity = '0';
              }}
            >
              {/* Note details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {page.icon || '📄'}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  title={page.title || 'Untitled'}
                >
                  {page.title || 'Untitled'}
                </span>
              </div>

              {/* Action buttons (fade on hover) */}
              <div
                className="trash-actions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 0,
                  transition: 'opacity 0.15s ease',
                  flexShrink: 0,
                  marginLeft: '8px',
                }}
              >
                {/* Restore Button */}
                <button
                  onClick={(e) => handleRestore(page.id, e)}
                  title="Restore note"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  data-testid={`restore-btn-${page.id}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </button>

                {/* Permanent Delete Button */}
                <button
                  onClick={(e) => handleDeletePermanently(page.id, e)}
                  title="Delete permanently"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef5350')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  data-testid={`delete-perm-btn-${page.id}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrashBin;
