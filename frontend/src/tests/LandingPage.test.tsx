import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as auth from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../components/common/ThemeToggle', () => ({
  default: () => <div data-testid="mock-theme-toggle">Mock Theme Toggle</div>,
}));

vi.mock('../components/editor/PreviewPane', () => ({
  default: ({ content }: { content: string }) => <div data-testid="mock-preview-pane">{content}</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders hero title and feature list details', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      isAuthenticated: false,
      isRestoringSession: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Title / subtitle checks
    expect(screen.getByText('Your thoughts, structured.')).toBeInTheDocument();
    expect(screen.getByText(/A premium, glassmorphic markdown canvas/i)).toBeInTheDocument();

    // Feature card headers
    expect(screen.getByText('Nested Workspace')).toBeInTheDocument();
    expect(screen.getByText('LaTeX Math')).toBeInTheDocument();
    expect(screen.getByText('Omnibar Search')).toBeInTheDocument();
  });

  test('renders guest CTAs when unauthenticated', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      isAuthenticated: false,
      isRestoringSession: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Buttons
    const getStartedBtns = screen.getAllByRole('button', { name: /Get Started/i });
    expect(getStartedBtns.length).toBeGreaterThan(0);
    const loginBtn = screen.getByRole('button', { name: 'Log In' });
    expect(loginBtn).toBeInTheDocument();

    // Click register CTA
    fireEvent.click(getStartedBtns[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/register');

    // Click login CTA
    fireEvent.click(loginBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders workspace access CTAs when authenticated', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      isAuthenticated: true,
      isRestoringSession: false,
      user: { username: 'testuser', email: 'test@example.com', id: 1 },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Go to workspace buttons should be visible
    expect(screen.getByRole('button', { name: 'Go to Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Your Workspace' })).toBeInTheDocument();

    // Click "Go to Workspace"
    fireEvent.click(screen.getByRole('button', { name: 'Go to Workspace' }));
    expect(mockNavigate).toHaveBeenCalledWith('/workspace');
  });

  test('interactive sandbox captures textarea changes and updates preview pane', () => {
    vi.mocked(auth.useAuth).mockReturnValue({
      isAuthenticated: false,
      isRestoringSession: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/Type your markdown here.../i);
    expect(textarea).toBeInTheDocument();

    // Update text
    fireEvent.change(textarea, { target: { value: '# Hello Antigravity' } });
    expect(screen.getAllByTestId('mock-preview-pane')[1]).toHaveTextContent('# Hello Antigravity');
  });
});
