import React from 'react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [rotation, setRotation] = React.useState(0);

  const handleToggle = () => {
    toggleTheme();
    setRotation((prev) => prev + 360);
  };

  return (
    <button
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        transition: 'background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        padding: 0,
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        e.currentTarget.style.transform = 'scale(1.06)';
        setRotation((prev) => prev + 360);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {theme === 'light' ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        ) : (
          <>
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </>
        )}
      </svg>
    </button>
  );
};
export default ThemeToggle;
