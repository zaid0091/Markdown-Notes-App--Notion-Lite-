/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef } from 'react';

export interface SlashCommandItem {
  label: string;
  description: string;
  icon: string;
  template: string;
  cursorOffset?: number; // cursor offset offset from the end of the template (e.g. negative to place cursor inside)
}

export const COMMANDS: SlashCommandItem[] = [
  { label: 'Heading 1', description: 'Big section heading', icon: 'H1', template: '# ' },
  { label: 'Heading 2', description: 'Medium section heading', icon: 'H2', template: '## ' },
  { label: 'Heading 3', description: 'Small section heading', icon: 'H3', template: '### ' },
  { label: 'Bullet List', description: 'Simple bulleted list', icon: '•', template: '- ' },
  { label: 'Numbered List', description: 'Sequential numbered list', icon: '1.', template: '1. ' },
  { label: 'Todo List', description: 'Checkbox todo list', icon: '☐', template: '- [ ] ' },
  { label: 'Code Block', description: 'Monospace code container', icon: '‹›', template: '```\n\n```', cursorOffset: -4 },
  { label: 'Quote', description: 'Quote highlight block', icon: '”', template: '> ' },
];

interface SlashMenuProps {
  onSelect: (item: SlashCommandItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  filterQuery: string;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  onSelect,
  onClose,
  position,
  activeIndex,
  setActiveIndex,
  filterQuery,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands by the query typed after the slash
  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Auto-adjust activeIndex if it exceeds the filtered list length
  useEffect(() => {
    if (activeIndex >= filteredCommands.length && filteredCommands.length > 0) {
      setActiveIndex(filteredCommands.length - 1);
    }
  }, [filteredCommands.length, activeIndex, setActiveIndex]);

  // Click outside to close handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (menuRef.current) {
      const activeEl = menuRef.current.children[activeIndex] as HTMLElement;
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="animate-slide-up"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '260px',
        maxHeight: '300px',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        padding: '6px 0',
      }}
    >
      {filteredCommands.map((cmd, idx) => {
        const isSelected = idx === activeIndex;
        return (
          <div
            key={cmd.label}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => setActiveIndex(idx)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
              transition: 'background-color 0.1s ease',
            }}
          >
            {/* Command Icon Badge */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
              marginRight: '10px',
              flexShrink: 0,
            }}>
              {cmd.icon}
            </div>

            {/* Command Details */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
              }}>
                {cmd.label}
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {cmd.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default SlashMenu;
