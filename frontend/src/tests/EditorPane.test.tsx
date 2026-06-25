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
});
