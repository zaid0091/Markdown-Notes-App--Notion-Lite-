import React, { useState, useRef, useEffect } from 'react';
import type { Page, Tag } from '../../types';
import {
  useTagsList,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useUpdatePage,
} from '../../hooks/usePages';
import TagBadge from './TagBadge';

interface TagSelectorProps {
  page: Page;
}

const PRESET_COLORS = [
  { name: 'Gray', hex: '#808080' },
  { name: 'Red', hex: '#ef5350' },
  { name: 'Orange', hex: '#f57c00' },
  { name: 'Yellow', hex: '#fbc02d' },
  { name: 'Green', hex: '#4caf50' },
  { name: 'Teal', hex: '#00897b' },
  { name: 'Blue', hex: '#2196f3' },
  { name: 'Purple', hex: '#9c27b0' },
  { name: 'Pink', hex: '#e91e63' },
];

export const TagSelector: React.FC<TagSelectorProps> = ({ page }) => {
  const { data: tags = [], isLoading } = useTagsList();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();
  const updatePageMutation = useUpdatePage();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('#808080');

  // Editing state
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const resetState = () => {
    setSearchQuery('');
    setSelectedColor('#808080');
    setEditingTag(null);
    setEditName('');
    setEditColor('');
  };

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        resetState();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  // Filter tags based on search query
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExactMatch = tags.some((t) => t.name.toLowerCase() === searchQuery.trim().toLowerCase());

  // Handle assigning/removing tag
  const handleTagToggle = (tag: Tag) => {
    const isAssigned = page.tags.includes(tag.id);
    const updatedTags = isAssigned
      ? page.tags.filter((id) => id !== tag.id)
      : [...page.tags, tag.id];

    updatePageMutation.mutate({
      id: page.id,
      data: { tags: updatedTags },
    });
  };

  // Handle creating new tag and auto-assigning it
  const handleCreateTag = async () => {
    const name = searchQuery.trim();
    if (!name) return;

    try {
      const newTag = await createTagMutation.mutateAsync({
        name,
        color: selectedColor,
      });
      // Auto-assign to page
      updatePageMutation.mutate({
        id: page.id,
        data: { tags: [...page.tags, newTag.id] },
      });
      setSearchQuery('');
      setSelectedColor('#808080');
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  // Start editing a tag
  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  // Save edited tag properties
  const handleSaveEdit = async () => {
    if (!editingTag || !editName.trim()) return;
    try {
      await updateTagMutation.mutateAsync({
        id: editingTag.id,
        data: {
          name: editName.trim(),
          color: editColor,
        },
      });
      setEditingTag(null);
    } catch (err) {
      console.error('Failed to update tag:', err);
    }
  };

  // Delete tag globally
  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Are you sure you want to delete this tag globally? It will be removed from all notes.')) {
      return;
    }
    try {
      await deleteTagMutation.mutateAsync(tagId);
      if (editingTag && editingTag.id === tagId) {
        setEditingTag(null);
      }
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  // Get full Tag object for the page's tag IDs
  const assignedTags = page.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter((t): t is Tag => !!t);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        marginTop: '12px',
        position: 'relative',
        minHeight: '26px',
      }}
      data-testid="tag-selector-container"
    >
      {/* Current Tag Badges */}
      {assignedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          onRemove={() => handleTagToggle(tag)}
        />
      ))}

      {/* Add Tag Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '3px 8px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-muted)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--accent-light)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'none';
        }}
        title="Manage tags"
        aria-expanded={isOpen}
      >
        ＋ Add tag
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: '32px',
            left: 0,
            zIndex: 100,
            width: '280px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backdropFilter: 'blur(8px)',
          }}
          data-testid="tags-popover"
        >
          {editingTag ? (
            /* Editing Sub-Panel */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '8px',
                }}
              >
                <button
                  onClick={() => setEditingTag(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title="Back to list"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Edit Tag
                </span>
              </div>

              {/* Tag Name Input */}
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
                placeholder="Tag name..."
              />

              {/* Preset Colors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Color
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setEditColor(c.hex)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: editColor === c.hex ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        padding: 0,
                        boxShadow: editColor === c.hex ? '0 0 4px rgba(0,0,0,0.2)' : 'none',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <button
                  onClick={() => handleDeleteTag(editingTag.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef5350',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                    padding: '6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete tag
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim()}
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    opacity: editName.trim() ? 1 : 0.5,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Main List Sub-Panel */
            <>
              {/* Search & Color Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or create tag..."
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  autoFocus
                />
              </div>

              {/* Show Tag Creation Trigger if not matching exactly */}
              {searchQuery.trim() && !isExactMatch && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setSelectedColor(c.hex)}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: c.hex,
                          border: selectedColor === c.hex ? '2px solid var(--text-primary)' : '1px solid rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCreateTag}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--accent-light)',
                      color: 'var(--accent-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Create new tag:</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {searchQuery.trim()}
                    </span>
                  </button>
                </div>
              )}

              {/* List of Tags */}
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginRight: '-4px',
                  paddingRight: '4px',
                }}
              >
                {isLoading ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                    Loading tags...
                  </span>
                ) : filteredTags.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                    No tags found
                  </span>
                ) : (
                  filteredTags.map((tag) => {
                    const isAssigned = page.tags.includes(tag.id);
                    return (
                      <div
                        key={tag.id}
                        onClick={() => handleTagToggle(tag)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          const editBtn = e.currentTarget.querySelector('.tag-edit-btn') as HTMLElement;
                          if (editBtn) editBtn.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          const editBtn = e.currentTarget.querySelector('.tag-edit-btn') as HTMLElement;
                          if (editBtn) editBtn.style.opacity = '0';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isAssigned ? 'var(--accent-color)' : 'var(--bg-primary)',
                            }}
                          >
                            {isAssigned && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {tag.name}
                          </span>
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: tag.color,
                            }}
                          />
                        </div>

                        {/* Inline Tag settings/edit trigger */}
                        <button
                          className="tag-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(tag);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'opacity 0.15s ease',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-secondary)',
                          }}
                          title="Edit tag properties"
                          data-testid={`edit-tag-btn-${tag.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
