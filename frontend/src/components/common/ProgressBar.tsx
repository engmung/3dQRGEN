/**
 * Progress Bar Component
 * Displays a horizontal progress bar with percentage-based color coding
 */
import React from 'react';
import { COLORS } from '../../constants/colors';

interface ProgressBarProps {
  percentage: number; // 0-100
  showLabel?: boolean; // 퍼센티지 표시 여부
  height?: number; // 바 높이 (px)
}

/**
 * Progress bar with automatic color coding based on percentage
 * - 0-50%: Green (AVAILABLE)
 * - 50-80%: Yellow (LIMITED)
 * - 80-100%: Red (FULL)
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  height = 24,
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Determine color based on percentage
  const getColor = (percent: number): string => {
    if (percent < 50) return COLORS.CAPACITY.AVAILABLE;
    if (percent < 80) return COLORS.CAPACITY.LIMITED;
    return COLORS.CAPACITY.FULL;
  };

  const barColor = getColor(clampedPercentage);

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: COLORS.UI.BORDER_LIGHT,
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clampedPercentage}%`,
            height: '100%',
            backgroundColor: barColor,
            transition: 'width 0.3s ease, background-color 0.3s ease',
            borderRadius: `${height / 2}px`,
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(height * 0.5, 12)}px`,
            fontWeight: 600,
            color: clampedPercentage > 40 ? '#fff' : COLORS.UI.TEXT_PRIMARY,
            textShadow:
              clampedPercentage > 40 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
            pointerEvents: 'none',
          }}
        >
          {clampedPercentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};
