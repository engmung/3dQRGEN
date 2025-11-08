/**
 * 원형 색상 버튼 컴포넌트
 */

import { COLORS } from '../../constants/colors';

type ColorButtonSize = 'sm' | 'md' | 'lg';

interface ColorButtonProps {
  color: string;
  selected?: boolean;
  size?: ColorButtonSize;
  onClick?: () => void;
  disabled?: boolean;
}

const SIZE_MAP: Record<ColorButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 50,
};

export default function ColorButton({
  color,
  selected = false,
  size = 'md',
  onClick,
  disabled = false,
}: ColorButtonProps) {
  const buttonSize = SIZE_MAP[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: buttonSize,
        height: buttonSize,
        backgroundColor: color,
        border: selected
          ? `3px solid ${COLORS.PRIMARY}`
          : `2px solid ${COLORS.UI.BORDER}`,
        borderRadius: '50%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        boxShadow: selected
          ? '0 0 0 2px rgba(255, 107, 107, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: 0,
        outline: 'none',
      }}
      aria-label={`색상: ${color}`}
      aria-pressed={selected}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    />
  );
}
