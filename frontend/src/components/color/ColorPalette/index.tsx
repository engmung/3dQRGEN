/**
 * 색상 팔레트 메인 컴포넌트
 * 리팩토링: 712 lines → ~180 lines
 */

import { useState, useEffect, useRef } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { getPricingSettings } from '../../../utils/pricing';
import { ColorGuideModal } from '../../ColorGuideModal';
import { ColorDropdown } from '../ColorDropdown';
import { ColorPickerModal } from '../ColorPickerModal';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import {
  isCombinationAllowed,
  DEFAULT_COLORS,
  DEFAULT_COMBINATIONS,
  type ColorInfo,
  type ColorCombination,
} from '../../../utils/colorValidator';

type ColorType = 'plate' | 'qr' | 'bg';

// 색상 버튼 컴포넌트 (컴포넌트 외부로 이동)
const ColorButton = ({ color, onClick, title, isMobile }: {
  color: string;
  onClick: () => void;
  title: string;
  isMobile: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: isMobile ? '32px' : '40px',
      height: isMobile ? '32px' : '40px',
      minWidth: isMobile ? '32px' : '40px',
      minHeight: isMobile ? '32px' : '40px',
      borderRadius: '50%',
      background: color,
      border: isMobile ? '2px solid #ddd' : '3px solid #ddd',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    title={title}
  />
);

export const ColorPalette = () => {
  const isMobile = useIsMobile();

  // Store
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const backgroundColor = useDesignStore((state) => state.backgroundColor);
  const updateSelectedPlateColor = useDesignStore((state) => state.updateSelectedPlateColor);
  const updateSelectedQrColor = useDesignStore((state) => state.updateSelectedQrColor);
  const setBackgroundColor = useDesignStore((state) => state.setBackgroundColor);

  const selectedPlate = selectedPlateId ? plates.find(p => p.id === selectedPlateId) : null;

  // State
  const [showPlatePicker, setShowPlatePicker] = useState(false);
  const [showQrPicker, setShowQrPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<ColorType>('plate');

  // 색상 시스템
  const [availableColors, setAvailableColors] = useState<ColorInfo[]>([]);
  const [allowedCombinations, setAllowedCombinations] = useState<ColorCombination[]>([]);
  const [colorWarningMessage, setColorWarningMessage] = useState<string>('');

  const platePickerRef = useRef<HTMLDivElement>(null);
  const qrPickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  // 색상 팔레트 로드
  useEffect(() => {
    const loadColorPalette = async () => {
      try {
        const settings = await getPricingSettings();
        setAvailableColors(JSON.parse(settings.available_colors || '[]'));
        setAllowedCombinations(JSON.parse(settings.allowed_combinations || '[]'));
        setColorWarningMessage(settings.color_warning_message || '');
      } catch (error) {
        console.error('Failed to load color palette:', error);
        setAvailableColors(DEFAULT_COLORS);
        setAllowedCombinations(DEFAULT_COMBINATIONS);
      }
    };

    loadColorPalette();
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    if (!showPlatePicker && !showQrPicker && !showBgPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (platePickerRef.current && !platePickerRef.current.contains(event.target as Node)) {
        setShowPlatePicker(false);
      }
      if (qrPickerRef.current && !qrPickerRef.current.contains(event.target as Node)) {
        setShowQrPicker(false);
      }
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target as Node)) {
        setShowBgPicker(false);
      }
    };

    // 다음 프레임에 리스너 추가 (현재 클릭 이벤트 이후)
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlatePicker, showQrPicker, showBgPicker]);

  const isInvalidCombination = selectedPlate && !isCombinationAllowed(
    selectedPlate.plateColor,
    selectedPlate.qrColor,
    allowedCombinations
  );

  return (
    <>
      {showColorGuide && (
        <ColorGuideModal
          availableColors={availableColors}
          allowedCombinations={allowedCombinations}
          colorWarningMessage={colorWarningMessage}
          onClose={() => setShowColorGuide(false)}
          currentPlateColor={selectedPlate?.plateColor}
          currentQrColor={selectedPlate?.qrColor}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: isMobile ? '50%' : '20px',
          left: isMobile ? 'auto' : '50%',
          right: isMobile ? '10px' : 'auto',
          transform: isMobile ? 'translateY(-50%)' : 'translateX(-50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '6px' : '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: isMobile ? '6px' : '10px 20px',
          borderRadius: isMobile ? '20px' : '50px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          userSelect: 'none',
        }}
      >
        {/* 판 색상 */}
        {selectedPlate && (
          <div style={{ position: 'relative' }} ref={platePickerRef}>
            <ColorButton
              color={selectedPlate.plateColor}
              onClick={() => {
                console.log('Plate button clicked, current state:', showPlatePicker);
                console.log('Available colors:', availableColors);
                setShowPlatePicker(!showPlatePicker);
                setShowQrPicker(false);
                setShowBgPicker(false);
              }}
              title="판 색상"
              isMobile={isMobile}
            />
            {showPlatePicker && (
              <ColorDropdown
                availableColors={availableColors}
                selectedColor={selectedPlate.plateColor}
                onColorSelect={updateSelectedPlateColor}
                onClose={() => setShowPlatePicker(false)}
                onOpenCustomPicker={() => {
                  setShowColorModal(true);
                  setActiveColorTab('plate');
                }}
                isMobile={isMobile}
              />
            )}
          </div>
        )}

        {/* QR 색상 */}
        {selectedPlate && (
          <div style={{ position: 'relative' }} ref={qrPickerRef}>
            <ColorButton
              color={selectedPlate.qrColor}
              onClick={() => {
                setShowQrPicker(!showQrPicker);
                setShowPlatePicker(false);
                setShowBgPicker(false);
              }}
              title="QR 색상"
              isMobile={isMobile}
            />
            {showQrPicker && (
              <ColorDropdown
                availableColors={availableColors}
                selectedColor={selectedPlate.qrColor}
                onColorSelect={updateSelectedQrColor}
                onClose={() => setShowQrPicker(false)}
                onOpenCustomPicker={() => {
                  setShowColorModal(true);
                  setActiveColorTab('qr');
                }}
                isMobile={isMobile}
                showWarning={(color) =>
                  selectedPlate ? isCombinationAllowed(selectedPlate.plateColor, color, allowedCombinations) : true
                }
              />
            )}
          </div>
        )}

        {/* 배경 색상 */}
        <div style={{ position: 'relative' }} ref={bgPickerRef}>
          <ColorButton
            color={backgroundColor}
            onClick={() => {
              setShowBgPicker(!showBgPicker);
              setShowPlatePicker(false);
              setShowQrPicker(false);
            }}
            title="배경 색상"
            isMobile={isMobile}
          />
          {showBgPicker && (
            <div
              style={isMobile ? {
                position: 'absolute',
                top: '0',
                right: '40px',
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                zIndex: 20,
                minWidth: '200px',
              } : {
                position: 'absolute',
                top: '50px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                zIndex: 20,
                minWidth: '200px',
              }}
            >
              <button
                onClick={() => {
                  setShowColorModal(true);
                  setActiveColorTab('bg');
                  setShowBgPicker(false);
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
                🎨 자유 색상
              </button>
            </div>
          )}
        </div>

        {/* 색상 안내 버튼 */}
        <button
          onClick={() => setShowColorGuide(true)}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            background: isInvalidCombination ? '#FF5252' : '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, background 0.2s',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = isInvalidCombination ? '#E53935' : '#45a049';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = isInvalidCombination ? '#FF5252' : '#4CAF50';
          }}
          title={isInvalidCombination ? '출력 불가능한 색상 조합' : '색상 안내'}
        >
          {isInvalidCombination ? '!' : '?'}
        </button>
      </div>

      {/* 색상 커스텀 모달 */}
      <ColorPickerModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        color={
          activeColorTab === 'plate' && selectedPlate ? selectedPlate.plateColor :
          activeColorTab === 'qr' && selectedPlate ? selectedPlate.qrColor :
          backgroundColor
        }
        onChange={(color) => {
          if (activeColorTab === 'plate' && selectedPlate) {
            updateSelectedPlateColor(color);
          } else if (activeColorTab === 'qr' && selectedPlate) {
            updateSelectedQrColor(color);
          } else {
            setBackgroundColor(color);
          }
        }}
      />
    </>
  );
};
