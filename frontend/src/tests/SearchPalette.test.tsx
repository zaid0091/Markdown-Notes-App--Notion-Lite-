import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchPalette } from '../components/search/SearchPalette';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { SearchResult } from '../types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hook creators
vi.mock('../hooks/usePages', () => ({
  useSearchPages: vi.fn(),
}));

describe('SearchPalette Component', () => {
  const mockResults: SearchResult[] = [
    {
      id: 'page-1',
      title: 'Django Setup',
      icon: '🐍',
      cover_image: null,
      is_favorite: false,
      created_at: '',
      updated_at: '',
      highlighted_title: 'Django <mark class="highlight">Setup</mark>',
      highlighted_content: 'Setting up <mark class="highlight">Django</mark> projects.',
      rank: 0.9,
    },
    {
      id: 'page-2',
      title: 'React Setup',
      icon: '⚛️',
      cover_image: null,
      is_favorite: true,
      created_at: '',
      updated_at: '',
      highlighted_title: 'React <mark class="highlight">Setup</mark>',
      highlighted_content: 'Setting up <mark class="highlight">React</mark> app with Vite.',
      rank: 0.8,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default search hook return: empty list
    vi.mocked(hooks.useSearchPages).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useSearchPages>);
  });

  test('does not render by default', () => {
    render(<SearchPalette />);
    expect(screen.queryByTestId('search-palette-overlay')).not.toBeInTheDocument();
  });

  test('toggles visibility on Ctrl+K keyboard shortcut', () => {
    render(<SearchPalette />);

    // Simulate Ctrl+K on window
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.getByTestId('search-palette-overlay')).toBeInTheDocument();

    // Simulate Ctrl+K again to toggle off
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.queryByTestId('search-palette-overlay')).not.toBeInTheDocument();
  });

  test('types in input field and displays matching highlighted search results', async () => {
    // Return mock results when query is active
    vi.mocked(hooks.useSearchPages).mockImplementation((query: string) => {
      if (query === 'Setup') {
        return {
          data: mockResults,
          isLoading: false,
        } as unknown as ReturnType<typeof hooks.useSearchPages>;
      }
      return {
        data: [],
        isLoading: false,
      } as unknown as ReturnType<typeof hooks.useSearchPages>;
    });

    render(<SearchPalette />);

    // Open palette
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });

    const input = screen.getByPlaceholderText('Search note titles or content...');
    
    // Type query
    fireEvent.change(input, { target: { value: 'Setup' } });
    expect(input).toHaveValue('Setup');

    // Verify useSearchPages was called
    expect(hooks.useSearchPages).toHaveBeenCalledWith('Setup');

    // Verify search items and highlights render
    await waitFor(() => {
      expect(screen.getByTestId('search-result-item-0')).toHaveTextContent('Django Setup');
      expect(screen.getByTestId('search-result-item-1')).toHaveTextContent('React Setup');
    });

    // Verify html highlights rendering
    const marks = screen.getAllByText('Setup');
    expect(marks).toHaveLength(2); // One in Django title, one in React title
    expect(marks[0].tagName).toBe('MARK');
    expect(marks[0]).toHaveClass('highlight');
  });

  test('keyboard navigation ArrowDown/ArrowUp and Enter redirects page', async () => {
    vi.mocked(hooks.useSearchPages).mockReturnValue({
      data: mockResults,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useSearchPages>);

    render(<SearchPalette />);
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });

    const input = screen.getByPlaceholderText('Search note titles or content...');
    
    // Type query so results show up
    fireEvent.change(input, { target: { value: 'Setup' } });

    // Initially first item index 0 is selected
    const item0 = screen.getByTestId('search-result-item-0');
    expect(item0.style.backgroundColor).toBe('var(--bg-secondary)');

    // Press ArrowDown
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const item1 = screen.getByTestId('search-result-item-1');
    expect(item1.style.backgroundColor).toBe('var(--bg-secondary)');
    expect(item0.style.backgroundColor).toBe('transparent');

    // Press ArrowUp (goes back to item 0)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(item0.style.backgroundColor).toBe('var(--bg-secondary)');

    // Press Enter to select Django Setup
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/page/page-1');
    expect(screen.queryByTestId('search-palette-overlay')).not.toBeInTheDocument();
  });

  test('closes on Escape or backdrop click', () => {
    render(<SearchPalette />);
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });

    expect(screen.getByTestId('search-palette-overlay')).toBeInTheDocument();

    // Escape closes modal
    const input = screen.getByPlaceholderText('Search note titles or content...');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('search-palette-overlay')).not.toBeInTheDocument();

    // Reopen and test backdrop click
    fireEvent.keyDown(window, { ctrlKey: true, key: 'k' });
    expect(screen.getByTestId('search-palette-overlay')).toBeInTheDocument();

    const overlay = screen.getByTestId('search-palette-overlay');
    fireEvent.click(overlay);
    expect(screen.queryByTestId('search-palette-overlay')).not.toBeInTheDocument();
  });
});
