import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  withBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 24,
  className = '',
  withBackground = false,
}) => {
  if (withBackground) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <defs>
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(265, 80%, 60%)" />
            <stop offset="100%" stopColor="hsl(190, 80%, 50%)" />
          </linearGradient>
        </defs>
        
        {/* Rounded background squircle */}
        <rect x="2" y="2" width="32" height="32" rx="8" fill="url(#logoBgGrad)" />
        
        {/* Document sheet representation inside */}
        <path
          d="M24 10H12a1.5 1.5 0 0 0-1.5 1.5v13a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-13a1.5 1.5 0 0 0-1.5-1.5z"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Page top fold */}
        <path
          d="M21 10v4h4"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        {/* Stylized N inside the document */}
        <path
          d="M14.5 21.5v-7.5l7 7.5V14"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Pure path outline variant (e.g. for already-styled CSS backgrounds)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Document shape */}
      <path d="M16 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      {/* Page fold */}
      <polyline points="14 2 14 8 20 8" />
      {/* Stylized N inside */}
      <path d="M7 17v-6l6 6v-6" strokeWidth="2.5" />
    </svg>
  );
};

export default BrandLogo;
