import React, { useState } from 'react';
import type { PageTreeNode } from '../../types';

interface PageNodeProps {
  node: PageTreeNode;
  activeId: string | undefined;
  level: number;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const PageNode: React.FC<PageNodeProps> = ({
  node,
  activeId,
  level,
  onSelect,
  onCreateChild,
  onToggleFavorite,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = node.id === activeId;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Node Row */}
      <div
        onClick={() => onSelect(node.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 8px',
          paddingLeft: `${level * 16 + 8}px`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          color: isActive ? 'var(--accent-color)' : 'var(--text-primary)',
          backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
          fontWeight: isActive ? 600 : 400,
          transition: 'background-color 0.15s ease, color 0.15s ease',
          position: 'relative',
        }}
        className="sidebar-node-row"
      >
        {/* Toggle Expand Arrow */}
        <span
          onClick={handleToggleExpand}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            marginRight: '4px',
            color: 'var(--text-secondary)',
            visibility: hasChildren ? 'visible' : 'hidden',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            cursor: 'pointer',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>

        {/* Node Icon Emoji or Default Doc SVG */}
        <span style={{ marginRight: '6px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
          {node.icon ? (
            node.icon
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          )}
        </span>

        {/* Node Title */}
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flexGrow: 1,
        }}>
          {node.title || 'Untitled'}
        </span>

        {/* Action icons (revealed on hover) */}
        <span className="node-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px',
        }}>
          {/* Favorite Toggle Icon */}
          <button
            onClick={(e) => onToggleFavorite(node.id, e)}
            title={node.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: node.is_favorite ? '#ffb300' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={node.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>

          {/* Add Child Page Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(node.id);
            }}
            title="Create sub-page inside"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </span>
      </div>

      {/* Render children recursively */}
      {hasChildren && isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {node.children.map((childNode) => (
            <PageNode
              key={childNode.id}
              node={childNode}
              activeId={activeId}
              level={level + 1}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default PageNode;
