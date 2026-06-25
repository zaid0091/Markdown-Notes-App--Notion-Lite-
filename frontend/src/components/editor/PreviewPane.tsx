import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface PreviewPaneProps {
  content: string;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ content }) => {
  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-primary)',
    }}>
      {/* Title / Header Bar */}
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
        <span style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Preview</span>
        <span>Render Canvas</span>
      </div>

      {/* Compiled Markdown Body Container */}
      <div
        className="markdown-body"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '24px 54px',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          lineHeight: '1.7',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default PreviewPane;
