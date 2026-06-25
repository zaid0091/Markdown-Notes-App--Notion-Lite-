import React, { useState, useRef, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import type { Page } from '../../types';
import { useUpdatePage, useToggleFavorite, useUploadCover } from '../../hooks/usePages';

interface PageHeaderProps {
  page: Page;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ page }) => {
  const updatePageMutation = useUpdatePage();
  const toggleFavoriteMutation = useToggleFavorite();
  const uploadCoverMutation = useUploadCover();

  const [title, setTitle] = useState(page.title);
  const [prevTitle, setPrevTitle] = useState(page.title);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Keep local title in sync with prop updates (e.g. from sidebar or other loads)
  if (page.title !== prevTitle) {
    setTitle(page.title);
    setPrevTitle(page.title);
  }

  // Click outside handler for Emoji Picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleTitleBlur = () => {
    if (title !== page.title) {
      updatePageMutation.mutate({
        id: page.id,
        data: { title: title || 'Untitled' },
      });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleSelectEmoji = (emojiNative: string) => {
    updatePageMutation.mutate({
      id: page.id,
      data: { icon: emojiNative },
    });
    setShowEmojiPicker(false);
  };

  const handleRemoveIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePageMutation.mutate({
      id: page.id,
      data: { icon: null },
    });
    setShowEmojiPicker(false);
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(page.id);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // 5MB Limit check
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image exceeds size limit of 5MB.');
      return;
    }

    // Format check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Only JPEG, PNG, and WEBP formats are supported.');
      return;
    }

    try {
      await uploadCoverMutation.mutateAsync({
        id: page.id,
        file,
      });
    } catch {
      setErrorMessage('Failed to upload cover image.');
    }
  };

  const handleRemoveCover = () => {
    updatePageMutation.mutate({
      id: page.id,
      data: { cover_image: null },
    });
  };

  const getCoverUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${formattedBaseUrl}${url}`;
  };

  const hasCover = !!page.cover_image;

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* Cover Image Area */}
      {hasCover ? (
        <div style={{
          position: 'relative',
          height: '240px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <img
            src={getCoverUrl(page.cover_image)}
            alt="Page cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Cover Actions Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(15, 15, 15, 0.65)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(15, 15, 15, 0.85)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(15, 15, 15, 0.65)')}
            >
              Change cover
            </button>
            <button
              onClick={handleRemoveCover}
              style={{
                background: 'rgba(15, 15, 15, 0.65)',
                color: '#ef5350',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(15, 15, 15, 0.85)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(15, 15, 15, 0.65)')}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div style={{ height: '60px' }} />
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div style={{
          margin: '12px 54px 0 54px',
          padding: '8px 16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #ffcdd2',
          borderRadius: '6px',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c62828',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Info Region */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 54px',
        position: 'relative',
      }}>
        {/* Favorite Icon (Absolute Positioned at top-right of the info region) */}
        <button
          onClick={handleToggleFavorite}
          title={page.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
          style={{
            position: 'absolute',
            top: hasCover ? '-15px' : '10px',
            right: '54px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: page.is_favorite ? '#ffb300' : 'var(--text-muted)',
            transition: 'transform 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={page.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>

        {/* Emoji Button Region */}
        <div style={{
          position: 'relative',
          marginTop: hasCover ? '-60px' : '0',
          display: 'inline-block',
          zIndex: 15,
        }}>
          {page.icon ? (
            <div
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                fontSize: '4.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '24px',
                boxShadow: hasCover ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                border: hasCover ? '4px solid var(--bg-primary)' : 'none',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {page.icon}
            </div>
          ) : (
            /* Hover Action Bar when Emoji & Cover are missing */
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              marginBottom: '16px',
            }}>
              <button
                onClick={() => setShowEmojiPicker(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--accent-light)';
                  e.currentTarget.style.color = 'var(--accent-color)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                📁 Add icon
              </button>
              {!hasCover && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--accent-light)';
                    e.currentTarget.style.color = 'var(--accent-color)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  🖼️ Add cover
                </button>
              )}
            </div>
          )}

          {/* Popover Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              style={{
                position: 'absolute',
                top: page.icon ? '100px' : '40px',
                left: '0',
                zIndex: 100,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '6px 12px',
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <button
                  onClick={handleRemoveIcon}
                  style={{
                    background: '#ef5350',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Remove Icon
                </button>
              </div>
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native: string }) => handleSelectEmoji(emoji.native)}
                theme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'}
              />
            </div>
          )}
        </div>

        {/* Title Borderless Input Field */}
        <div style={{ marginTop: '24px', width: '100%' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            style={{
              width: '100%',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '0',
              lineHeight: '1.2',
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default PageHeader;
