import React from 'react';
import { COLORS } from '../../constants/colors';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: '4px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '8px 16px', fontSize: '16px' },
    lg: { padding: '12px 24px', fontSize: '18px' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: isHovered ? COLORS.BUTTON.PRIMARY_HOVER : COLORS.BUTTON.PRIMARY,
      color: '#fff',
    },
    secondary: {
      backgroundColor: isHovered ? COLORS.BUTTON.SECONDARY_HOVER : COLORS.BUTTON.SECONDARY,
      color: '#fff',
    },
    danger: {
      backgroundColor: isHovered ? COLORS.BUTTON.DANGER_HOVER : COLORS.BUTTON.DANGER,
      color: '#fff',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.UI.TEXT_PRIMARY,
      border: `1px solid ${COLORS.UI.BORDER}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] }}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
};
