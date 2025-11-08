/**
 * 드래그 가능한 HexColorPicker 모달 컴포넌트
 * ColorPalette에서 추출
 */

import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
}) => {
  const [modalPos, setModalPos] = useState(() => {
    const saved = localStorage.getItem('colorPickerModalPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 모달 위치 변경 시 localStorage 저장
  useEffect(() => {
    localStorage.setItem('colorPickerModalPosition', JSON.stringify(modalPos));
  }, [modalPos]);

  // 드래그 시 스크롤 방지 (강화)
  useEffect(() => {
    if (isDragging) {
      const preventScroll = (e: TouchEvent) => e.preventDefault();
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.removeEventListener('touchmove', preventScroll);
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      };
    }
  }, [isDragging]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 모달 내부 클릭이 아니면 닫기
      if (!target.closest('[data-color-modal]')) {
        onClose();
      }
    };

    // 약간의 딜레이 후 이벤트 리스너 등록 (모달 열릴 때 바로 닫히는 것 방지)
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-color-modal
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${modalPos.x}px), calc(-50% + ${modalPos.y}px))`,
        backgroundColor: 'white',
        padding: '12px',
        paddingTop: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
        zIndex: 2000,
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - modalPos.x, y: e.clientY - modalPos.y });
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setModalPos({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - modalPos.x, y: touch.clientY - modalPos.y });
      }}
      onTouchMove={(e) => {
        if (isDragging) {
          const touch = e.touches[0];
          setModalPos({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
          });
        }
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* 드래그 핸들 영역 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          cursor: isDragging ? 'grabbing' : 'grab',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      />

      {/* HexColorPicker */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <HexColorPicker
          color={color}
          onChange={onChange}
          style={{ width: '150px', height: '150px' }}
        />
      </div>
    </div>
  );
};
