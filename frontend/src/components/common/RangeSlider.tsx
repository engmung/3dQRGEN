/**
 * RangeSlider 컴포넌트
 * 범위 슬라이더 (숫자 값 조정)
 */

import React from 'react';
import { COLORS } from '../../constants/colors';

export interface RangeSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  showValue?: boolean;
  showMinMax?: boolean;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  error,
  helperText,
  disabled = false,
  required = false,
  showValue = true,
  showMinMax = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // 슬라이더 진행도 계산 (0~100%)
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`range-slider ${className}`}>
      <div style={styles.header}>
        {label && (
          <label style={styles.label}>
            {label}
            {required && <span style={styles.required}>*</span>}
          </label>
        )}

        {showValue && (
          <div style={styles.valueDisplay}>
            {value}
            {unit && <span style={styles.unit}>{unit}</span>}
          </div>
        )}
      </div>

      <div style={styles.sliderContainer}>
        <input
          type="range"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          style={{
            ...styles.slider,
            ...(disabled && styles.sliderDisabled),
          }}
        />
        {/* 진행도 배경 (CSS 변수 사용) */}
        <div
          style={{
            ...styles.sliderTrack,
            background: disabled
              ? '#E0E0E0'
              : `linear-gradient(to right, ${COLORS.SECONDARY} 0%, ${COLORS.SECONDARY} ${percentage}%, ${COLORS.UI.BORDER} ${percentage}%, ${COLORS.UI.BORDER} 100%)`,
          }}
        />
      </div>

      {showMinMax && (
        <div style={styles.minMaxContainer}>
          <span style={styles.minMaxText}>
            {min}
            {unit}
          </span>
          <span style={styles.minMaxText}>
            {max}
            {unit}
          </span>
        </div>
      )}

      {error && <div style={styles.errorText}>{error}</div>}
      {!error && helperText && <div style={styles.helperText}>{helperText}</div>}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  } as React.CSSProperties,

  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,

  required: {
    color: COLORS.DANGER,
    marginLeft: '4px',
  } as React.CSSProperties,

  valueDisplay: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.SECONDARY,
  } as React.CSSProperties,

  unit: {
    marginLeft: '2px',
    fontSize: '12px',
    fontWeight: 400,
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,

  sliderContainer: {
    position: 'relative' as const,
    width: '100%',
  } as React.CSSProperties,

  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative' as const,
    zIndex: 2,
  } as React.CSSProperties,

  sliderDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  } as React.CSSProperties,

  sliderTrack: {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    height: '6px',
    borderRadius: '3px',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    zIndex: 1,
  } as React.CSSProperties,

  minMaxContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
  } as React.CSSProperties,

  minMaxText: {
    fontSize: '11px',
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,

  errorText: {
    marginTop: '6px',
    fontSize: '12px',
    color: COLORS.DANGER,
  } as React.CSSProperties,

  helperText: {
    marginTop: '6px',
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,
};
