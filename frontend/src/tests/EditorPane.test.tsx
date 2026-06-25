import { render, screen, fireEvent, act } from '@testing-library/react';
import { EditorPane } from '../components/editor/EditorPane';
import { vi, expect, test, describe, beforeEach, afterEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { Page } from '../types';

// Mock hook creators
vi.mock('../hooks/usePages', () => ({
  useUpdatePage: vi.fn(),
}));

describe('EditorPane Component', () => {
  const mockPage: Page = {
    id: 'page-456',
    title: 'Awesome Note',
    content: 'Initial markdown content.',
    parent: null,
    icon: null,
    cover_image: null,
    is_favorite: false,
    is_archived: false,
    created_at: '',
    updated_at: '',
    tags: [],
    user: 1,
  };

  const mockMutateUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.mocked(hooks.useUpdatePage).mockReturnValue({
      mutate: mockMutateUpdate,
    } as unknown as ReturnType<typeof hooks.useUpdatePage>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders initial content and save status correctly', () => {
    render(<EditorPane page={mockPage} />);

    // Verify Save Status Bar
    expect(screen.getByText('All changes saved')).toBeInTheDocument();

    // Verify Textarea contains initial markdown content
    const textarea = screen.getByPlaceholderText(/Start writing in Markdown/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial markdown content.');
  });

  test('shows saving status on edit and triggers debounced mutation after 1 second', () => {
    render(<EditorPane page={mockPage} />);

    const textarea = screen.getByPlaceholderText(/Start writing in Markdown/i) as HTMLTextAreaElement;

    // Simulate typing
    fireEvent.change(textarea, { target: { value: 'User is typing some new markdown text...' } });
    expect(textarea.value).toBe('User is typing some new markdown text...');

    // Status should change to saving immediately
    expect(screen.getByText('Saving changes...')).toBeInTheDocument();

    // Wait 500ms - mutation should not have fired yet
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateUpdate).not.toHaveBeenCalled();

    // Wait another 500ms (1000ms total) - mutation should fire
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockMutateUpdate).toHaveBeenCalledWith(
      {
        id: 'page-456',
        data: { content: 'User is typing some new markdown text...' },
      },
      expect.any(Object)
    );

    // Call the success callback passed to mutate to transition state to saved
    const successCallback = mockMutateUpdate.mock.calls[0][1].onSuccess;
    act(() => {
      successCallback();
    });

    expect(screen.getByText('All changes saved')).toBeInTheDocument();
  });

  test('shows Notion-style SlashMenu when typing slash and handles command selection', () => {
    render(<EditorPane page={mockPage} />);

    const textarea = screen.getByPlaceholderText(/Start writing in Markdown/i) as HTMLTextAreaElement;
    textarea.focus();

    // Set value to include a slash at the end
    fireEvent.change(textarea, {
      target: { value: 'Initial markdown content.\n/', selectionStart: 27 },
    });

    // SlashMenu should pop up and display Heading commands
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Code Block')).toBeInTheDocument();

    // Select Heading 2 option by clicking on it
    const h2Option = screen.getByText('Heading 2');
    fireEvent.click(h2Option);

    // Value should be replaced by '## '
    expect(textarea.value).toBe('Initial markdown content.\n## ');
  });

  test('handles keyboard arrow keys and enter key navigation in SlashMenu', () => {
    render(<EditorPane page={mockPage} />);

    const textarea = screen.getByPlaceholderText(/Start writing in Markdown/i) as HTMLTextAreaElement;
    textarea.focus();

    // Set value to include a slash
    fireEvent.change(textarea, {
      target: { value: 'test /', selectionStart: 6 },
    });

    // Press ArrowDown to select Heading 2
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    // Press ArrowDown to select Heading 3
    fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    
    // Press Enter to confirm selection
    fireEvent.keyDown(textarea, { key: 'Enter' });

    // The text should be replaced with Heading 3 template: '### '
    expect(textarea.value).toBe('test ### ');
  });
});
