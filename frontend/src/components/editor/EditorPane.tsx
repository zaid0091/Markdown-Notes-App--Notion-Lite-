import React, { useState, useEffect } from 'react';
import type { Page } from '../../types';
import { useUpdatePage } from '../../hooks/usePages';

interface EditorPaneProps {
  page: Page;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ page }) => {
  const updatePageMutation = useUpdatePage();
  const [content, setContent] = useState(page.content);
  const [prevContent, setPrevContent] = useState(page.content);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Sync prop updates synchronously in render to prevent useEffect cascading render warning
  if (page.content !== prevContent) {
    setContent(page.content);
    setPrevContent(page.content);
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
          setSaveStatus('saved'); // Reset status on failure, though error logs to console
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, page.id, page.content, updatePageMutation]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
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
              {/* Subtle saving animation circle */}
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

      {/* Borderless Textarea Canvas */}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaveStatus('saving');
        }}
        placeholder="Start writing in Markdown... (Use slash / for styling shortcuts)"
        style={{
          width: '100%',
          height: '100%',
          flexGrow: 1,
          resize: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          padding: '24px 54px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default EditorPane;
