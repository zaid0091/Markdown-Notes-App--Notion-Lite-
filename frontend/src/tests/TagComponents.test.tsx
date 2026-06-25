import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { TagBadge } from '../components/tags/TagBadge';
import { TagSelector } from '../components/tags/TagSelector';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { Page, Tag } from '../types';

// Mock hook creators
vi.mock('../hooks/usePages', () => ({
  useTagsList: vi.fn(),
  useCreateTag: vi.fn(),
  useUpdateTag: vi.fn(),
  useDeleteTag: vi.fn(),
  useUpdatePage: vi.fn(),
}));

describe('TagBadge Component', () => {
  const mockTag: Tag = {
    id: 'tag-1',
    name: 'Research',
    color: '#ef5350',
    pages: [],
    user: 1,
    created_at: '',
  };

  test('renders tag name and colored circle correctly', () => {
    render(<TagBadge tag={mockTag} />);
    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<TagBadge tag={mockTag} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Research'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('calls onRemove handler when close button is clicked', () => {
    const handleRemove = vi.fn();
    render(<TagBadge tag={mockTag} onRemove={handleRemove} />);
    
    const removeBtn = screen.getByRole('button', { name: /remove tag/i });
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});

describe('TagSelector Component', () => {
  const mockPage: Page = {
    id: 'page-123',
    title: 'Notes',
    content: '',
    parent: null,
    icon: null,
    cover_image: null,
    is_favorite: false,
    is_archived: false,
    created_at: '',
    updated_at: '',
    tags: ['tag-1'],
    user: 1,
  };

  const mockTags: Tag[] = [
    {
      id: 'tag-1',
      name: 'Research',
      color: '#ef5350',
      pages: ['page-123'],
      user: 1,
      created_at: '',
    },
    {
      id: 'tag-2',
      name: 'Draft',
      color: '#2196f3',
      pages: [],
      user: 1,
      created_at: '',
    },
  ];

  const mockMutateUpdatePage = vi.fn();
  const mockMutateAsyncCreateTag = vi.fn();
  const mockMutateAsyncUpdateTag = vi.fn();
  const mockMutateAsyncDeleteTag = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default returns for hooks
    vi.mocked(hooks.useTagsList).mockReturnValue({
      data: mockTags,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useTagsList>);

    vi.mocked(hooks.useUpdatePage).mockReturnValue({
      mutate: mockMutateUpdatePage,
    } as unknown as ReturnType<typeof hooks.useUpdatePage>);

    vi.mocked(hooks.useCreateTag).mockReturnValue({
      mutateAsync: mockMutateAsyncCreateTag,
    } as unknown as ReturnType<typeof hooks.useCreateTag>);

    vi.mocked(hooks.useUpdateTag).mockReturnValue({
      mutateAsync: mockMutateAsyncUpdateTag,
    } as unknown as ReturnType<typeof hooks.useUpdateTag>);

    vi.mocked(hooks.useDeleteTag).mockReturnValue({
      mutateAsync: mockMutateAsyncDeleteTag,
    } as unknown as ReturnType<typeof hooks.useDeleteTag>);
  });

  test('renders current page tags', () => {
    render(<TagSelector page={mockPage} />);
    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
  });

  test('opens popover when clicking Add Tag button', () => {
    render(<TagSelector page={mockPage} />);
    
    // Popover is closed initially
    expect(screen.queryByTestId('tags-popover')).not.toBeInTheDocument();

    // Click trigger
    const addBtn = screen.getByRole('button', { name: /add tag/i });
    fireEvent.click(addBtn);

    // Popover is visible now
    expect(screen.getByTestId('tags-popover')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search or create tag...')).toBeInTheDocument();
  });

  test('toggles tag assignment when clicked in popover', () => {
    render(<TagSelector page={mockPage} />);
    
    const addBtn = screen.getByRole('button', { name: /add tag/i });
    fireEvent.click(addBtn);

    const popover = screen.getByTestId('tags-popover');

    // Draft tag in the list is unassigned. Let's click it to assign.
    const draftItem = within(popover).getByText('Draft');
    fireEvent.click(draftItem);

    expect(mockMutateUpdatePage).toHaveBeenCalledWith({
      id: 'page-123',
      data: { tags: ['tag-1', 'tag-2'] },
    });

    // Research tag is assigned. Let's click it to remove.
    const researchItem = within(popover).getByText('Research');
    fireEvent.click(researchItem);

    expect(mockMutateUpdatePage).toHaveBeenCalledWith({
      id: 'page-123',
      data: { tags: [] },
    });
  });

  test('allows creating a new tag and auto-assigns it to the page', async () => {
    const newMockTag: Tag = {
      id: 'tag-3',
      name: 'Science',
      color: '#808080',
      pages: [],
      user: 1,
      created_at: '',
    };
    mockMutateAsyncCreateTag.mockResolvedValue(newMockTag);

    render(<TagSelector page={mockPage} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    const searchInput = screen.getByPlaceholderText('Search or create tag...');
    fireEvent.change(searchInput, { target: { value: 'Science' } });

    // The create button should appear
    const createBtn = screen.getByRole('button', { name: /create new tag/i });
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);

    expect(mockMutateAsyncCreateTag).toHaveBeenCalledWith({
      name: 'Science',
      color: '#808080',
    });

    await waitFor(() => {
      expect(mockMutateUpdatePage).toHaveBeenCalledWith({
        id: 'page-123',
        data: { tags: ['tag-1', 'tag-3'] },
      });
    });
  });

  test('allows editing tag properties', async () => {
    render(<TagSelector page={mockPage} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    // Click edit/settings cog for Research tag
    const editBtn = screen.getByTestId('edit-tag-btn-Research');
    fireEvent.click(editBtn);

    // Edit view is now active
    expect(screen.getByText('Edit Tag')).toBeInTheDocument();
    
    // Find input and color bubbles
    const editInput = screen.getByPlaceholderText('Tag name...');
    expect(editInput).toHaveValue('Research');

    fireEvent.change(editInput, { target: { value: 'Research Project' } });
    
    // Choose red color presets (preset red is #ef5350)
    const redColorBubble = screen.getByTitle('Red');
    fireEvent.click(redColorBubble);

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsyncUpdateTag).toHaveBeenCalledWith({
        id: 'tag-1',
        data: {
          name: 'Research Project',
          color: '#ef5350',
        },
      });
    });
  });

  test('allows deleting a tag globally', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<TagSelector page={mockPage} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add tag/i }));

    const editBtn = screen.getByTestId('edit-tag-btn-Research');
    fireEvent.click(editBtn);

    const deleteBtn = screen.getByRole('button', { name: /delete tag/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockMutateAsyncDeleteTag).toHaveBeenCalledWith('tag-1');
    });
  });
});
