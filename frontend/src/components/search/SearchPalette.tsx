import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchPages } from '../../hooks/usePages';

export const SearchPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState('');

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useSearchPages(query);

  // Sync activeIndex and query during render to avoid cascading renders
  if (query !== prevQuery) {
    setActiveIndex(0);
    setPrevQuery(query);
  }

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
        setQuery('');
        setActiveIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);


  // Scroll active item into view inside results panel
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Navigation and keyboard handler within the modal
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[activeIndex]) {
        handleNavigateToPage(results[activeIndex].id);
      }
    }
  };

  const handleNavigateToPage = (id: string) => {
    navigate(`/page/${id}`);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 15, 15, 0.45)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={() => setIsOpen(false)}
      data-testid="search-palette-overlay"
      className="animate-fade-in"
    >
      {/* Modal Card Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '450px',
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="search-palette-modal"
        className="animate-slide-up"
      >
        {/* Input area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color)',
            gap: '12px',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleModalKeyDown}
            placeholder="Search note titles or content..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              fontFamily: 'inherit',
            }}
            data-testid="search-palette-input"
          />
        </div>

        {/* Results view */}
        <div
          ref={resultsContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
          data-testid="search-results-list"
        >
          {query.trim().length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Type to search note titles and text content...
            </div>
          ) : isLoading ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Searching workspace...
            </div>
          ) : results.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No matching pages found
            </div>
          ) : (
            results.map((result, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={result.id}
                  onClick={() => handleNavigateToPage(result.id)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className="search-result-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    gap: '4px',
                  }}
                  data-testid={`search-result-item-${idx}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', userSelect: 'none' }}>
                      {result.icon || '📄'}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: result.highlighted_title || result.title,
                      }}
                    />
                  </div>
                  {result.highlighted_content && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        paddingLeft: '24px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                      dangerouslySetInnerHTML={{ __html: result.highlighted_content }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info panel */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-sidebar)',
            display: 'flex',
            gap: '16px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '2px 4px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            >
              ↑↓
            </span>{' '}
            to navigate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '2px 4px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            >
              ↵
            </span>{' '}
            to select
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '2px 4px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            >
              esc
            </span>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchPalette;
