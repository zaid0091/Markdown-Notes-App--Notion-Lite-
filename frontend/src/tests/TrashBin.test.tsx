import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrashBin } from '../components/sidebar/TrashBin';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { Page } from '../types';
import React from 'react';

// Mock hooks
vi.mock('../hooks/usePages', () => ({
  usePagesList: vi.fn(),
  useRestorePage: vi.fn(),
  useDeletePage: vi.fn(),
}));

describe('TrashBin Component', () => {
  const mockArchivedPages: Page[] = [
    {
      id: 'page-archive-1',
      title: 'Archived Page A',
      content: '',
      parent: null,
      icon: '🗑️',
      cover_image: null,
      is_favorite: false,
      is_archived: true,
      created_at: '',
      updated_at: '',
      tags: [],
      user: 1,
    },
    {
      id: 'page-archive-2',
      title: 'Old Draft B',
      content: '',
      parent: null,
      icon: null,
      cover_image: null,
      is_favorite: false,
      is_archived: true,
      created_at: '',
      updated_at: '',
      tags: [],
      user: 1,
    },
  ];

  const mockMutateAsyncRestore = vi.fn();
  const mockMutateAsyncDelete = vi.fn();
  const mockOnClose = vi.fn();
  const mockTriggerRef = { current: document.createElement('button') };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.usePagesList).mockReturnValue({
      data: mockArchivedPages,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePagesList>);

    vi.mocked(hooks.useRestorePage).mockReturnValue({
      mutateAsync: mockMutateAsyncRestore,
    } as unknown as ReturnType<typeof hooks.useRestorePage>);

    vi.mocked(hooks.useDeletePage).mockReturnValue({
      mutateAsync: mockMutateAsyncDelete,
    } as unknown as ReturnType<typeof hooks.useDeletePage>);
  });

  test('does not render if isOpen is false', () => {
    render(
      <TrashBin
        isOpen={false}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );
    expect(screen.queryByTestId('trash-bin-popover')).not.toBeInTheDocument();
  });

  test('renders popover with archived pages list when isOpen is true', () => {
    render(
      <TrashBin
        isOpen={true}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );

    expect(screen.getByTestId('trash-bin-popover')).toBeInTheDocument();
    expect(screen.getByText('Archived Page A')).toBeInTheDocument();
    expect(screen.getByText('Old Draft B')).toBeInTheDocument();
  });

  test('filters list based on search text input', () => {
    render(
      <TrashBin
        isOpen={true}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );

    const input = screen.getByPlaceholderText('Filter by title...');
    fireEvent.change(input, { target: { value: 'Old' } });

    expect(screen.getByText('Old Draft B')).toBeInTheDocument();
    expect(screen.queryByText('Archived Page A')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <TrashBin
        isOpen={true}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );

    const closeBtn = screen.getByTitle('Close Trash');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('triggers restore page mutation when clicked', async () => {
    render(
      <TrashBin
        isOpen={true}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );

    const restoreBtn = screen.getByTestId('restore-btn-page-archive-1');
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(mockMutateAsyncRestore).toHaveBeenCalledWith('page-archive-1');
    });
  });

  test('triggers delete page mutation when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <TrashBin
        isOpen={true}
        onClose={mockOnClose}
        triggerRef={mockTriggerRef}
      />
    );

    const deleteBtn = screen.getByTestId('delete-perm-btn-page-archive-2');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockMutateAsyncDelete).toHaveBeenCalledWith('page-archive-2');
    });
  });
});
