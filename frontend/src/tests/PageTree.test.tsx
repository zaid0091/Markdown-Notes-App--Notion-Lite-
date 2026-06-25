import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageTree } from '../components/sidebar/PageTree';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { PageTreeNode, Page } from '../types';

// Mock the hooks
vi.mock('../hooks/usePages', () => ({
  usePageTree: vi.fn(),
  usePagesList: vi.fn(),
  useCreatePage: vi.fn(),
  useToggleFavorite: vi.fn(),
  useUpdatePage: vi.fn(),
}));

describe('PageTree Component', () => {
  const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
  }));

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      useParams: () => ({ id: '1' }),
    };
  });

  const mockTreeNodes: PageTreeNode[] = [
    {
      id: '1',
      title: 'Parent Page',
      icon: '📁',
      is_favorite: false,
      parent: null,
      children: [
        {
          id: '2',
          title: 'Child Page',
          icon: null,
          is_favorite: false,
          parent: '1',
          children: [],
        },
      ],
    },
  ];

  const mockFavoritePages: Page[] = [
    {
      id: '3',
      title: 'Favorite Page',
      content: 'Favorite Content',
      parent: null,
      icon: '⭐',
      cover_image: null,
      is_favorite: true,
      is_archived: false,
      created_at: '',
      updated_at: '',
      tags: [],
      user: 0,
    },
  ];

  const mockMutateAsyncCreate = vi.fn();
  const mockMutateAsyncFavorite = vi.fn();
  const mockMutateAsyncUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.usePageTree).mockReturnValue({
      data: mockTreeNodes,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePageTree>);

    vi.mocked(hooks.usePagesList).mockReturnValue({
      data: mockFavoritePages,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePagesList>);

    vi.mocked(hooks.useCreatePage).mockReturnValue({
      mutateAsync: mockMutateAsyncCreate,
    } as unknown as ReturnType<typeof hooks.useCreatePage>);

    vi.mocked(hooks.useToggleFavorite).mockReturnValue({
      mutateAsync: mockMutateAsyncFavorite,
    } as unknown as ReturnType<typeof hooks.useToggleFavorite>);

    vi.mocked(hooks.useUpdatePage).mockReturnValue({
      mutateAsync: mockMutateAsyncUpdate,
    } as unknown as ReturnType<typeof hooks.useUpdatePage>);
  });

  test('renders favorites and page tree nodes correctly', () => {
    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    // Verify Favorites Section
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Favorite Page')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();

    // Verify Private Pages Section
    expect(screen.getByText('Private Pages')).toBeInTheDocument();
    expect(screen.getByText('Parent Page')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByText('Child Page')).toBeInTheDocument();
  });

  test('calls navigate when a page node is clicked', () => {
    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    const childPage = screen.getByText('Child Page');
    fireEvent.click(childPage);

    expect(mockNavigate).toHaveBeenCalledWith('/page/2');
  });

  test('allows creating a new root page', async () => {
    mockMutateAsyncCreate.mockResolvedValueOnce({ id: 'new-root-id' });

    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    const createRootBtn = screen.getByTitle('Create a new root page');
    fireEvent.click(createRootBtn);

    expect(mockMutateAsyncCreate).toHaveBeenCalledWith({
      title: 'Untitled',
      parent: null,
      content: '',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/page/new-root-id');
    });
  });

  test('allows creating a child page from a parent node hover action', async () => {
    mockMutateAsyncCreate.mockResolvedValueOnce({ id: 'new-child-id' });

    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    const createChildBtns = screen.getAllByTitle('Create sub-page inside');
    // First button corresponds to the parent node
    fireEvent.click(createChildBtns[0]);

    expect(mockMutateAsyncCreate).toHaveBeenCalledWith({
      title: 'Untitled',
      parent: '1',
      content: '',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/page/new-child-id');
    });
  });

  test('allows toggling favorite status', async () => {
    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    const favoriteBtns = screen.getAllByTitle('Add to Favorites');
    // Click favorite toggle button on the parent page
    fireEvent.click(favoriteBtns[0]);

    expect(mockMutateAsyncFavorite).toHaveBeenCalledWith('1');
  });

  test('allows moving a page and prevents circular selection', async () => {
    const mockAllPages: Page[] = [
      {
        id: '1',
        title: 'Parent Page',
        content: '',
        parent: null,
        icon: null,
        cover_image: null,
        is_favorite: false,
        is_archived: false,
        created_at: '',
        updated_at: '',
        tags: [],
        user: 1,
      },
      {
        id: '2',
        title: 'Child Page',
        content: '',
        parent: '1',
        icon: null,
        cover_image: null,
        is_favorite: false,
        is_archived: false,
        created_at: '',
        updated_at: '',
        tags: [],
        user: 1,
      },
      {
        id: '4',
        title: 'Another Root Page',
        content: '',
        parent: null,
        icon: null,
        cover_image: null,
        is_favorite: false,
        is_archived: false,
        created_at: '',
        updated_at: '',
        tags: [],
        user: 1,
      },
    ];

    vi.mocked(hooks.usePagesList).mockImplementation((filters) => {
      if (filters?.is_favorite) {
        return { data: mockFavoritePages, isLoading: false } as unknown as ReturnType<typeof hooks.usePagesList>;
      }
      return { data: mockAllPages, isLoading: false } as unknown as ReturnType<typeof hooks.usePagesList>;
    });

    render(
      <MemoryRouter>
        <PageTree />
      </MemoryRouter>
    );

    const moveButtons = screen.getAllByTitle('Move page');
    fireEvent.click(moveButtons[0]); // Click Move on Parent Page

    const selectDropdown = screen.getByRole('combobox');
    expect(selectDropdown).toBeInTheDocument();

    const options = screen.getAllByRole('option') as HTMLOptionElement[];
    const optionValues = options.map((opt) => opt.value);

    expect(optionValues).toContain('');
    expect(optionValues).toContain('4');
    expect(optionValues).not.toContain('1');
    expect(optionValues).not.toContain('2');

    fireEvent.change(selectDropdown, { target: { value: '4' } });

    expect(mockMutateAsyncUpdate).toHaveBeenCalledWith({
      id: '1',
      data: { parent: '4' },
    });
  });
});
