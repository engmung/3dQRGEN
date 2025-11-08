import React from 'react';
import { COLORS } from '../../constants/colors';

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  children,
  variant = 'info',
}) => {
  const variantStyles = {
    info: {
      backgroundColor: '#E3F2FD',
      color: '#1976D2',
      icon: 'ℹ️',
    },
    warning: {
      backgroundColor: '#FFF3E0',
      color: '#F57C00',
      icon: '⚠️',
    },
    error: {
      backgroundColor: '#FFEBEE',
      color: '#D32F2F',
      icon: '❌',
    },
    success: {
      backgroundColor: '#E8F5E9',
      color: '#388E3C',
      icon: '✅',
    },
  };

  const style = variantStyles[variant];

  const boxStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor,
    color: style.color,
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
  };

  return (
    <div style={boxStyle}>
      <span style={{ fontSize: '18px' }}>{style.icon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};
