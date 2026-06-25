import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageHeader } from '../components/editor/PageHeader';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import * as hooks from '../hooks/usePages';
import type { Page } from '../types';

// Mock hook creators
vi.mock('../hooks/usePages', () => ({
  useUpdatePage: vi.fn(),
  useToggleFavorite: vi.fn(),
  useUploadCover: vi.fn(),
  useTagsList: vi.fn(),
  useCreateTag: vi.fn(),
  useUpdateTag: vi.fn(),
  useDeleteTag: vi.fn(),
  useExportPDF: vi.fn(),
}));

// Mock emoji picker to keep jsdom clean and execution fast
vi.mock('@emoji-mart/react', () => {
  return {
    default: ({ onEmojiSelect }: { onEmojiSelect: (emoji: { native: string }) => void }) => (
      <button onClick={() => onEmojiSelect({ native: '🚀' })} data-testid="mock-emoji-picker">
        Select Rocket Emoji
      </button>
    ),
  };
});

describe('PageHeader Component', () => {
  const mockPage: Page = {
    id: 'page-123',
    title: 'My Awesome Note',
    content: 'Some content',
    parent: null,
    icon: '📝',
    cover_image: '/media/covers/banner.jpg',
    is_favorite: false,
    is_archived: false,
    created_at: '',
    updated_at: '',
    tags: [],
    user: 1,
  };

  const mockMutateUpdate = vi.fn();
  const mockMutateFavorite = vi.fn();
  const mockMutateAsyncUpload = vi.fn();
  const mockMutateAsyncExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useUpdatePage).mockReturnValue({
      mutate: mockMutateUpdate,
    } as unknown as ReturnType<typeof hooks.useUpdatePage>);

    vi.mocked(hooks.useToggleFavorite).mockReturnValue({
      mutate: mockMutateFavorite,
    } as unknown as ReturnType<typeof hooks.useToggleFavorite>);

    vi.mocked(hooks.useUploadCover).mockReturnValue({
      mutateAsync: mockMutateAsyncUpload,
    } as unknown as ReturnType<typeof hooks.useUploadCover>);

    vi.mocked(hooks.useTagsList).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useTagsList>);

    vi.mocked(hooks.useCreateTag).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useCreateTag>);

    vi.mocked(hooks.useUpdateTag).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useUpdateTag>);

    vi.mocked(hooks.useDeleteTag).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useDeleteTag>);

    vi.mocked(hooks.useExportPDF).mockReturnValue({
      mutateAsync: mockMutateAsyncExport,
    } as unknown as ReturnType<typeof hooks.useExportPDF>);
  });

  test('renders page title, cover image, and emoji correctly', () => {
    render(<PageHeader page={mockPage} />);

    // Verify Title
    const titleInput = screen.getByDisplayValue('My Awesome Note') as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();

    // Verify Cover image
    const coverImg = screen.getByAltText('Page cover') as HTMLImageElement;
    expect(coverImg).toBeInTheDocument();
    expect(coverImg.src).toContain('/media/covers/banner.jpg');

    // Verify Emoji
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  test('triggers title update patch mutation on input blur', () => {
    render(<PageHeader page={mockPage} />);

    const titleInput = screen.getByDisplayValue('My Awesome Note') as HTMLInputElement;
    
    // Change value
    fireEvent.change(titleInput, { target: { value: 'New Edited Title' } });
    expect(titleInput.value).toBe('New Edited Title');

    // Blur input to trigger auto-save mutation
    fireEvent.blur(titleInput);

    expect(mockMutateUpdate).toHaveBeenCalledWith({
      id: 'page-123',
      data: { title: 'New Edited Title' },
    });
  });

  test('triggers favorite toggle mutation when clicked', () => {
    render(<PageHeader page={mockPage} />);

    const favBtn = screen.getByTitle('Add to Favorites');
    fireEvent.click(favBtn);

    expect(mockMutateFavorite).toHaveBeenCalledWith('page-123');
  });

  test('allows changing page emoji icon', async () => {
    render(<PageHeader page={mockPage} />);

    // Click on the existing icon to toggle picker
    const iconBtn = screen.getByText('📝');
    fireEvent.click(iconBtn);

    // Emoji picker mock button should be rendered
    const pickerBtn = screen.getByTestId('mock-emoji-picker');
    expect(pickerBtn).toBeInTheDocument();

    // Click to select the new rocket emoji
    fireEvent.click(pickerBtn);

    expect(mockMutateUpdate).toHaveBeenCalledWith({
      id: 'page-123',
      data: { icon: '🚀' },
    });
  });

  test('allows removing emoji icon', () => {
    render(<PageHeader page={mockPage} />);

    // Open picker
    const iconBtn = screen.getByText('📝');
    fireEvent.click(iconBtn);

    // Click remove button
    const removeBtn = screen.getByText('Remove Icon');
    fireEvent.click(removeBtn);

    expect(mockMutateUpdate).toHaveBeenCalledWith({
      id: 'page-123',
      data: { icon: null },
    });
  });

  test('allows removing cover image', () => {
    render(<PageHeader page={mockPage} />);

    const removeBtn = screen.getByText('Remove');
    fireEvent.click(removeBtn);

    expect(mockMutateUpdate).toHaveBeenCalledWith({
      id: 'page-123',
      data: { cover_image: null },
    });
  });

  test('validates and uploads cover image file successfully', async () => {
    render(<PageHeader page={mockPage} />);

    const changeBtn = screen.getByText('Change cover');
    expect(changeBtn).toBeInTheDocument();

    // Trigger file change
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    
    // Grab the hidden input element
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Simulate selecting file
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockMutateAsyncUpload).toHaveBeenCalledWith({
        id: 'page-123',
        file,
      });
    });
  });

  test('shows size warning error when cover file size exceeds 5MB limit', async () => {
    render(<PageHeader page={mockPage} />);

    // Create a dummy file > 5MB (6 * 1024 * 1024 bytes)
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText('Image exceeds size limit of 5MB.')).toBeInTheDocument();
    expect(mockMutateAsyncUpload).not.toHaveBeenCalled();
  });

  test('renders export to pdf button', () => {
    render(<PageHeader page={mockPage} />);
    expect(screen.getByTitle('Export to PDF')).toBeInTheDocument();
  });

  test('triggers PDF export download successfully', async () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = mockClick;
      }
      return el;
    });

    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    mockMutateAsyncExport.mockResolvedValue(mockBlob);

    render(<PageHeader page={mockPage} />);

    const exportBtn = screen.getByTitle('Export to PDF');
    fireEvent.click(exportBtn);

    expect(exportBtn).toHaveAttribute('title', 'Exporting to PDF...');

    await waitFor(() => {
      expect(mockMutateAsyncExport).toHaveBeenCalledWith('page-123');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  test('shows error banner when PDF export fails', async () => {
    mockMutateAsyncExport.mockRejectedValue(new Error('Export failed'));

    render(<PageHeader page={mockPage} />);

    const exportBtn = screen.getByTitle('Export to PDF');
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to export PDF.')).toBeInTheDocument();
    });
  });
});
