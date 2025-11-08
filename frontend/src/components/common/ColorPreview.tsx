/**
 * 색상 미리보기 블록 컴포넌트
 */

import { COLORS } from '../../constants/colors';

type ColorPreviewLayout = 'horizontal' | 'vertical';

interface ColorPreviewProps {
  color: string;
  label: string;
  layout?: ColorPreviewLayout;
  showColorValue?: boolean;
}

export default function ColorPreview({
  color,
  label,
  layout = 'horizontal',
  showColorValue = true,
}: ColorPreviewProps) {
  const isVertical = layout === 'vertical';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'stretch' : 'center',
        gap: isVertical ? '8px' : '12px',
      }}
    >
      {/* 색상 블록 */}
      <div
        style={{
          width: isVertical ? '100%' : '60px',
          height: isVertical ? '60px' : '40px',
          backgroundColor: color,
          border: `2px solid ${COLORS.UI.BORDER}`,
          borderRadius: '8px',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        aria-label={`색상 미리보기: ${color}`}
      />

      {/* 텍스트 정보 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: isVertical ? undefined : 1,
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: COLORS.UI.TEXT_PRIMARY,
          }}
        >
          {label}
        </span>
        {showColorValue && (
          <span
            style={{
              fontSize: '12px',
              color: COLORS.UI.TEXT_SECONDARY,
              fontFamily: 'monospace',
            }}
          >
            {color}
          </span>
        )}
      </div>
    </div>
  );
}
