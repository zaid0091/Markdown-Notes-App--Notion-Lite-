import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../../types';
import { useUpdatePage } from '../../hooks/usePages';
import { SlashMenu, COMMANDS, type SlashCommandItem } from './SlashMenu';

interface EditorPaneProps {
  page: Page;
  onChange?: (val: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ page, onChange }) => {
  const updatePageMutation = useUpdatePage();
  
  const [content, setContent] = useState(page.content);
  const [prevContent, setPrevContent] = useState(page.content);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
    query: string;
    startIndex: number;
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    query: '',
    startIndex: -1,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync prop updates synchronously in render to prevent useEffect cascading render warning
  if (page.content !== prevContent) {
    setContent(page.content);
    setPrevContent(page.content);
    // Auto-close slash menu on page navigation
    if (slashMenu.isOpen) {
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    }
  }

  // Debounce saving note content 1 second after user stops typing
  useEffect(() => {
    // If the local content matches the server content, do nothing
    if (content === page.content) {
      return;
    }

    const timer = setTimeout(() => {
      updatePageMutation.mutate({
        id: page.id,
        data: { content },
      }, {
        onSuccess: () => {
          setSaveStatus('saved');
        },
        onError: () => {
          setSaveStatus('saved');
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, page.id, page.content, updatePageMutation]);

  // Check if slash menu should open/close on key inputs or selections
  const checkSlashTrigger = (text: string, selectionStart: number) => {
    const textBeforeCursor = text.slice(0, selectionStart);
    const lastNewline = textBeforeCursor.lastIndexOf('\n');
    const currentLineText = textBeforeCursor.slice(lastNewline + 1);
    const lastSlash = currentLineText.lastIndexOf('/');

    if (lastSlash !== -1) {
      const textAfterSlash = currentLineText.slice(lastSlash + 1);
      // Only trigger if there is no space between '/' and the cursor
      if (!textAfterSlash.includes(' ')) {
        const textUpToSlash = textBeforeCursor.slice(0, lastNewline + 1 + lastSlash);
        const lines = textUpToSlash.split('\n');
        const cursorLineIndex = lines.length - 1;
        const cursorCharIndex = lines[cursorLineIndex].length;

        // Consolas-specific caret positioning coordinates math
        const top = cursorLineIndex * 24 + 48; // 24px line height + 24px top padding + 24px line gap
        const left = cursorCharIndex * 9 + 54;  // 9px character width in Consolas + 54px left padding

        setSlashMenu({
          isOpen: true,
          position: { top, left },
          query: textAfterSlash,
          startIndex: lastNewline + 1 + lastSlash,
        });
        return;
      }
    }

    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus('saving');
    checkSlashTrigger(val, e.target.selectionStart);
    if (onChange) {
      onChange(val);
    }
  };

  const handleSelectCommand = (item: SlashCommandItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const beforeText = content.slice(0, slashMenu.startIndex);
    const afterText = content.slice(selectionStart);

    const newContent = beforeText + item.template + afterText;
    setContent(newContent);
    setSaveStatus('saving');
    if (onChange) {
      onChange(newContent);
    }

    // Close menu
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));

    // Refocus and place cursor at correct index
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = slashMenu.startIndex + item.template.length + (item.cursorOffset || 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Keyboard navigation within the textarea while SlashMenu is active
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!slashMenu.isOpen) return;

    const filtered = COMMANDS.filter((cmd) =>
      cmd.label.toLowerCase().includes(slashMenu.query.toLowerCase())
    );

    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectCommand(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
    }}>
      {/* Save Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 54px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        userSelect: 'none',
      }}>
        <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Editor</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {saveStatus === 'saving' ? (
            <>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                display: 'inline-block',
                opacity: 0.6,
              }} />
              <span>Saving changes...</span>
            </>
          ) : (
            <>
              <span style={{ color: '#2e7d32' }}>✓</span>
              <span>All changes saved</span>
            </>
          )}
        </span>
      </div>

      {/* Editor Content Canvas Container */}
      <div style={{ position: 'relative', flexGrow: 1, height: '100%', overflowY: 'auto' }}>
        {/* Borderless Textarea Canvas */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Start writing in Markdown... (Use slash / for styling shortcuts)"
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
            fontSize: '15px',
            lineHeight: '24px',
            padding: '24px 54px',
            boxSizing: 'border-box',
          }}
        />

        {/* Slash Command Overlay Menu */}
        {slashMenu.isOpen && (
          <SlashMenu
            onSelect={handleSelectCommand}
            onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
            position={slashMenu.position}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            filterQuery={slashMenu.query}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPane;
