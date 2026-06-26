import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotePage } from '../pages/NotePage';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import * as auth from '../hooks/useAuth';
import type { Page } from '../types';

// Mock hook creators
vi.mock('../hooks/usePages', () => ({
  usePageDetails: vi.fn(),
  usePageTree: vi.fn(() => ({ data: [], isLoading: false })),
  usePagesList: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock layout wrapper
vi.mock('../components/layout/WorkspaceLayout', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-layout">{children}</div>,
  };
});

// Mock child components
vi.mock('../components/editor/PageHeader', () => ({
  PageHeader: () => <div data-testid="mock-page-header">Mock Page Header</div>,
}));

vi.mock('../components/editor/EditorPane', () => ({
  EditorPane: () => <div data-testid="mock-editor-pane">Mock Editor Pane</div>,
}));

vi.mock('../components/editor/PreviewPane', () => ({
  PreviewPane: () => <div data-testid="mock-preview-pane">Mock Preview Pane</div>,
}));

// Mock useParams from react-router-dom
let mockParamsId: string | undefined = undefined;
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: mockParamsId }),
  };
});

describe('NotePage Component', () => {
  const mockUser = { username: 'testuser', email: 'test@example.com', id: 1 };
  
  const mockPageData: Page = {
    id: 'page-abc',
    title: 'composed title',
    content: 'composed markdown content',
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockParamsId = undefined;

    vi.mocked(auth.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isRestoringSession: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(hooks.usePageDetails).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePageDetails>);
  });

  test('renders empty/welcome state dashboard when no page id is provided', () => {
    mockParamsId = undefined;

    render(
      <MemoryRouter>
        <NotePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Notion Lite, testuser!')).toBeInTheDocument();
    expect(screen.getByText('Select a note from the sidebar or create a new one to get started.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-page-header')).not.toBeInTheDocument();
  });

  test('renders loading screen when page details are loading', () => {
    mockParamsId = 'page-abc';
    
    vi.mocked(hooks.usePageDetails).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof hooks.usePageDetails>);

    render(
      <MemoryRouter>
        <NotePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading note details...')).toBeInTheDocument();
  });

  test('renders assembled header, editor, and preview components when data is loaded', () => {
    mockParamsId = 'page-abc';

    vi.mocked(hooks.usePageDetails).mockReturnValue({
      data: mockPageData,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePageDetails>);

    render(
      <MemoryRouter>
        <NotePage />
      </MemoryRouter>
    );

    // Verify layout loaded
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();

    // Verify all children are mounted in default 'split' mode
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor-pane')).toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument();
  });

  test('allows switching viewMode and adjusts rendering columns', () => {
    mockParamsId = 'page-abc';

    vi.mocked(hooks.usePageDetails).mockReturnValue({
      data: mockPageData,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.usePageDetails>);

    render(
      <MemoryRouter>
        <NotePage />
      </MemoryRouter>
    );

    // Default view Mode is 'split' - both editor and preview should render
    expect(screen.getByTestId('mock-editor-pane')).toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument();

    // Click 'edit' mode button
    const editBtn = screen.getByRole('button', { name: 'edit' });
    fireEvent.click(editBtn);

    // Only editor pane should be visible now
    expect(screen.getByTestId('mock-editor-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-preview-pane')).not.toBeInTheDocument();

    // Click 'preview' mode button
    const previewBtn = screen.getByRole('button', { name: 'preview' });
    fireEvent.click(previewBtn);

    // Only preview pane should be visible now
    expect(screen.queryByTestId('mock-editor-pane')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-preview-pane')).toBeInTheDocument();
  });
});
