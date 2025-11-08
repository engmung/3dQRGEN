/**
 * 클립보드 복사 버튼 컴포넌트
 */

import { useState } from 'react';
import { COLORS } from '../../constants/colors';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: {
    padding: '6px 12px',
    fontSize: '12px',
    iconSize: 14,
  },
  md: {
    padding: '8px 16px',
    fontSize: '14px',
    iconSize: 16,
  },
  lg: {
    padding: '10px 20px',
    fontSize: '16px',
    iconSize: 18,
  },
};

export default function CopyButton({
  value,
  label = '복사',
  variant = 'secondary',
  size = 'md',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const getButtonColor = () => {
    if (variant === 'primary') return COLORS.BUTTON.PRIMARY;
    if (variant === 'secondary') return COLORS.BUTTON.SECONDARY;
    return COLORS.BUTTON.GHOST;
  };

  const getHoverColor = () => {
    if (variant === 'primary') return COLORS.BUTTON.PRIMARY_HOVER;
    if (variant === 'secondary') return COLORS.BUTTON.SECONDARY_HOVER;
    return COLORS.UI.BORDER;
  };

  const sizeStyle = SIZE_STYLES[size];
  const backgroundColor = getButtonColor();
  const isGhost = variant === 'ghost';

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        backgroundColor: isGhost ? 'transparent' : backgroundColor,
        color: isGhost ? COLORS.UI.TEXT_PRIMARY : '#fff',
        border: isGhost ? `1px solid ${COLORS.UI.BORDER}` : 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: 500,
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (isGhost) {
          e.currentTarget.style.backgroundColor = COLORS.UI.BORDER_LIGHT;
        } else {
          e.currentTarget.style.backgroundColor = getHoverColor();
        }
      }}
      onMouseLeave={(e) => {
        if (isGhost) {
          e.currentTarget.style.backgroundColor = 'transparent';
        } else {
          e.currentTarget.style.backgroundColor = backgroundColor;
        }
      }}
    >
      {/* 아이콘 */}
      <svg
        width={sizeStyle.iconSize}
        height={sizeStyle.iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {copied ? (
          // 체크 아이콘
          <polyline points="20 6 9 17 4 12" />
        ) : (
          // 복사 아이콘
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>

      {/* 텍스트 */}
      <span>{copied ? '복사됨!' : label}</span>
    </button>
  );
}
