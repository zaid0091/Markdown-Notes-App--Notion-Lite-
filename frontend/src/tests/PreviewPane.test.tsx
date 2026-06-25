import { render, screen } from '@testing-library/react';
import { PreviewPane } from '../components/editor/PreviewPane';
import { expect, test, describe } from 'vitest';

describe('PreviewPane Component', () => {
  test('renders markdown headings correctly', () => {
    const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
    render(<PreviewPane content={markdown} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
  });

  test('renders GFM lists and checklists correctly', () => {
    const markdown = '- [ ] Task Todo\n- Normal Bullet Item';
    render(<PreviewPane content={markdown} />);

    // Verify task checklist item checkbox
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Verify list element content
    expect(screen.getByText('Normal Bullet Item')).toBeInTheDocument();
  });

  test('renders formatted text and quote blocks correctly', () => {
    const markdown = '**Bold Text** and *Italic Text*\n\n> This is a quote block.';
    render(<PreviewPane content={markdown} />);

    // Check bold text rendering
    const boldEl = screen.getByText('Bold Text');
    expect(boldEl.tagName).toBe('STRONG');

    // Check italic text rendering
    const italicEl = screen.getByText('Italic Text');
    expect(italicEl.tagName).toBe('EM');

    // Check blockquote rendering
    expect(screen.getByText('This is a quote block.').parentElement?.tagName).toBe('BLOCKQUOTE');
  });

  test('renders inline code and pre code blocks correctly', () => {
    const markdown = 'Here is `inline code` and a block:\n\n```javascript\nconst a = 123;\n```';
    render(<PreviewPane content={markdown} />);

    // Check inline code element
    const inlineCode = screen.getByText('inline code');
    expect(inlineCode.tagName).toBe('CODE');

    // Check pre-code block element
    const codeElement = document.querySelector('pre code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement?.textContent?.trim()).toBe('const a = 123;');
    expect(codeElement?.parentElement?.tagName).toBe('PRE');
  });
});
