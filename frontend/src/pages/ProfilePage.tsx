import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getAssetUrl } from '../api/client';
import WorkspaceLayout from '../components/layout/WorkspaceLayout';
import '../styles/profile.css';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shouldRemovePicture, setShouldRemovePicture] = useState(false);

  // Load plan from localStorage on mount and set title
  useEffect(() => {
    const savedPlan = localStorage.getItem('user_plan') || 'free';
    setPlan(savedPlan);
    document.title = "Notion Lite | Account Settings";
  }, []);

  const getPlanDisplayName = (planValue: string) => {
    switch (planValue) {
      case 'pro':
        return 'Pro Developer';
      case 'org':
        return 'Organization';
      case 'free':
      default:
        return 'Free Sandbox';
    }
  };

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setPreviewUrl(user.profile_picture ? getAssetUrl(user.profile_picture) : null);
      setSelectedFile(null);
      setShouldRemovePicture(false);
    }
  }, [user]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 5MB file size limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Profile picture size must be under 5MB.');
      return;
    }

    // Enforce allowed image file types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Only PNG, JPEG, and WEBP image formats are supported.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShouldRemovePicture(false);
  };

  const handleRemoveAvatar = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShouldRemovePicture(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      } else if (shouldRemovePicture) {
        formData.append('profile_picture', '');
      }

      await updateUser(formData);
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      const responseData = err.response?.data;
      let msg = 'Failed to update profile. Please verify your inputs.';
      if (responseData) {
        if (responseData.username) {
          msg = `Username error: ${responseData.username.join(' ')}`;
        } else if (responseData.email) {
          msg = `Email error: ${responseData.email.join(' ')}`;
        } else if (responseData.profile_picture) {
          msg = `Profile picture error: ${responseData.profile_picture.join(' ')}`;
        } else if (responseData.detail) {
          msg = responseData.detail;
        }
      }
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userInitials = username ? username.slice(0, 2).toUpperCase() : 'NL';

  return (
    <WorkspaceLayout>
      <div className="profile-workspace-view animate-fade-in">
        <div className="profile-header-section">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div 
              className="profile-avatar-giant uploadable"
              onClick={handleAvatarClick}
              title="Upload profile picture"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Profile Avatar" className="profile-avatar-img-giant" />
              ) : (
                userInitials
              )}
              <div className="profile-avatar-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Edit</span>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: 'none' }}
            />

            {previewUrl && (
              <button
                type="button"
                className="profile-remove-pic-btn animate-fade-in"
                onClick={handleRemoveAvatar}
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="profile-title-block">
            <h1>Account Settings</h1>
            <p>Manage your account credentials, preferences, and view your workspace details.</p>
          </div>
        </div>

        <div className="profile-grid-layout">
          {/* Form Side */}
          <div className="profile-settings-card">
            <div>
              <h2 className="profile-card-title">Personal Information</h2>
              <p className="profile-card-subtitle">Update your primary identity settings.</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {successMessage && <div className="profile-alert-success">{successMessage}</div>}
              {errorMessage && <div className="profile-alert-error">{errorMessage}</div>}

              <div className="form-group">
                <label className="form-label" htmlFor="profile-username">
                  Username
                </label>
                <div className="profile-input-wrapper">
                  <input
                    id="profile-username"
                    type="text"
                    className="profile-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. johndoe"
                    disabled={saving}
                  />
                  <div className="profile-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">
                  Email Address
                </label>
                <div className="profile-input-wrapper">
                  <input
                    id="profile-email"
                    type="email"
                    className="profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    disabled={saving}
                  />
                  <div className="profile-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
              </div>

              <button type="submit" className="profile-btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Stats & Theme Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Stats Card */}
            <div className="profile-settings-card">
              <div>
                <h2 className="profile-card-title">Workspace Information</h2>
                <p className="profile-card-subtitle">Overview of your account and notes.</p>
              </div>

              <div className="profile-stats-list">
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Subscription Plan</span>
                  <span className="profile-stat-val" style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{getPlanDisplayName(plan)}</span>
                </div>
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Workspace Status</span>
                  <span className="profile-stat-val" style={{ color: '#4caf50' }}>● Synchronized</span>
                </div>
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Security Protocol</span>
                  <span className="profile-stat-val">httpOnly JWT Cookie</span>
                </div>
                <div className="profile-stat-row">
                  <span className="profile-stat-label">Account ID</span>
                  <span className="profile-stat-val">NL-00{user?.id || 1}</span>
                </div>
              </div>
            </div>

            {/* Theme Card */}
            <div className="profile-settings-card">
              <div>
                <h2 className="profile-card-title">Appearance Settings</h2>
                <p className="profile-card-subtitle">Choose your visual preference.</p>
              </div>

              <div className="theme-options-grid">
                <div
                  className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => theme !== 'light' && toggleTheme()}
                >
                  <div className="theme-card-preview light"></div>
                  <span className="theme-card-label">Light Mode</span>
                </div>

                <div
                  className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => theme !== 'dark' && toggleTheme()}
                >
                  <div className="theme-card-preview dark"></div>
                  <span className="theme-card-label">Dark Mode</span>
                </div>
              </div>
            </div>

            {/* Sign Out Card */}
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ef5350',
                color: '#ef5350',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#ef5350';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ef5350';
              }}
            >
              Sign Out of Account
            </button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default ProfilePage;
