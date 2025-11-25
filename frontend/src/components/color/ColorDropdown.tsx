/**
 * 색상 선택 드롭다운 컴포넌트
 * ColorPalette에서 추출한 재사용 가능 컴포넌트
 */

import React from 'react';
import type { ColorInfo } from '../../utils/colorValidator';

interface ColorDropdownProps {
  availableColors: ColorInfo[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
  onOpenCustomPicker: () => void;
  isMobile: boolean;
  showWarning?: (color: string) => boolean;
}

export const ColorDropdown: React.FC<ColorDropdownProps> = ({
  availableColors,
  selectedColor,
  onColorSelect,
  onClose,
  onOpenCustomPicker,
  isMobile,
  showWarning,
}) => {
  return (
    <div
      style={isMobile ? {
        position: 'absolute',
        top: '0',
        right: '40px',
        width: '200px',
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 20,
        maxHeight: '80vh',
        overflowY: 'auto',
      } : {
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 20,
        minWidth: '200px',
      }}
    >
      {availableColors.map((color) => {
        const hasWarning = showWarning ? !showWarning(color.value) : false;

        return (
          <button
            key={color.value}
            onClick={() => {
              onColorSelect(color.value);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: selectedColor === color.value ? '2px solid #333' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: selectedColor === color.value ? '#f5f5f5' : 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: selectedColor === color.value ? 600 : 400,
              whiteSpace: 'nowrap',
              outline: 'none',
              opacity: hasWarning ? 0.5 : 1,
            }}
            title={hasWarning ? 'Invalid Combination' : ''}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: color.value,
                border: '1px solid #ccc',
              }}
            />
            {color.name}
            {hasWarning && <span style={{ fontSize: '11px', color: '#ff9800' }}>⚠️</span>}
          </button>
        );
      })}

      {/* 구분선 */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: '#ddd',
          margin: '4px 0',
        }}
      />

      {/* 자유 색상 버튼 */}
      <button
        onClick={() => {
          onOpenCustomPicker();
          onClose();
        }}
        style={{
          padding: '10px 12px',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          backgroundColor: 'white',
          color: '#4CAF50',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          outline: 'none',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f8f4'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        🎨 Custom Color
      </button>
    </div>
  );
};
