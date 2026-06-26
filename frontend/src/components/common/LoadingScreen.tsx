import React from 'react';
import BrandLogo from './BrandLogo';

export const LoadingScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <style>
        {`
          @keyframes logoPulse {
            0% { 
              transform: scale(0.92); 
              opacity: 0.6; 
              filter: drop-shadow(0 0 0px rgba(170, 59, 255, 0)); 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 1; 
              filter: drop-shadow(0 0 20px rgba(170, 59, 255, 0.45)); 
            }
            100% { 
              transform: scale(0.92); 
              opacity: 0.6; 
              filter: drop-shadow(0 0 0px rgba(170, 59, 255, 0)); 
            }
          }
          .pulse-logo {
            animation: logoPulse 1.8s infinite ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>
      <div className="pulse-logo">
        <BrandLogo size={64} withBackground={true} />
      </div>
    </div>
  );
};

export default LoadingScreen;
