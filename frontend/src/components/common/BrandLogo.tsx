import React from 'react';
import logoImg from '../../assets/logo.svg';

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
  return (
    <img
      src={logoImg}
      alt="Notion Lite Logo"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        borderRadius: withBackground ? '4px' : '0',
        backgroundColor: withBackground ? 'var(--bg-primary)' : 'transparent',
        padding: withBackground ? '2px' : '0',
        boxShadow: withBackground ? '0 2px 5px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    />
  );
};

export default BrandLogo;
