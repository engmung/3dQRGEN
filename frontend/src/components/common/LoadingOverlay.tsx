import React from 'react';
import { COLORS } from '../../constants/colors';

interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = '처리 중...',
  fullScreen = true,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: fullScreen ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.UI.OVERLAY,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const spinnerStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={overlayStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle} />
      {text && (
        <p style={{ color: '#fff', marginTop: '20px', fontSize: '16px' }}>
          {text}
        </p>
      )}
    </div>
  );
};
