import React from 'react';
import type { Tag } from '../../types';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Helper to convert hex to rgb
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 128, g: 128, b: 128 };
};

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove, onClick, style }) => {
  const { r, g, b } = hexToRgb(tag.color);

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 500,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    color: `rgb(${r}, ${g}, ${b})`,
    border: `1px solid rgba(${r}, ${g}, ${b}, 0.25)`,
    lineHeight: 1,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    gap: '4px',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = `0 2px 4px rgba(${r}, ${g}, ${b}, 0.15)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.12)`;
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <span
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={badgeStyle}
      data-testid={`tag-badge-${tag.name}`}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: tag.color,
          display: 'inline-block',
        }}
      />
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: `rgb(${r}, ${g}, ${b})`,
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.85rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '2px',
            opacity: 0.7,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          title="Remove tag"
          aria-label={`Remove tag ${tag.name}`}
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default TagBadge;
