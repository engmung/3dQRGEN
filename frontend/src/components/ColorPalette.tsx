import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDesignStore } from '../store/useDesignStore';
import { getPricingSettings } from '../utils/pricing';
import { ColorGuideModal } from './ColorGuideModal';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ColorInfo {
  name: string;
  value: string;
}

interface ColorCombination {
  colors: string[];
}

export const ColorPalette = () => {
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const backgroundColor = useDesignStore((state) => state.backgroundColor);
  const updateSelectedPlateColor = useDesignStore((state) => state.updateSelectedPlateColor);
  const updateSelectedQrColor = useDesignStore((state) => state.updateSelectedQrColor);
  const setBackgroundColor = useDesignStore((state) => state.setBackgroundColor);

  const isMobile = useIsMobile();
  const [showPlatePicker, setShowPlatePicker] = useState(false);
  const [showQrPicker, setShowQrPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showColorGuide, setShowColorGuide] = useState(false);

  // 통합 색상 모달 상태
  const [showColorModal, setShowColorModal] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<'plate' | 'qr' | 'bg'>('plate');
  const [colorModalPos, setColorModalPos] = useState(() => {
    const saved = localStorage.getItem('colorPickerModalPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 색상 시스템 (API에서 로드)
  const [availableColors, setAvailableColors] = useState<ColorInfo[]>([]);
  const [allowedCombinations, setAllowedCombinations] = useState<ColorCombination[]>([]);
  const [colorWarningMessage, setColorWarningMessage] = useState<string>('');

  const platePickerRef = useRef<HTMLDivElement>(null);
  const qrPickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  // 선택된 판이 없으면 배경 색상만 표시
  const selectedPlate = selectedPlateId ? plates.find(p => p.id === selectedPlateId) : null;

  // 모달 위치 변경 시 localStorage 저장
  useEffect(() => {
    localStorage.setItem('colorPickerModalPosition', JSON.stringify(colorModalPos));
  }, [colorModalPos]);

  // 드래그 시 스크롤 방지 (강화)
  useEffect(() => {
    if (isDraggingModal) {
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
  }, [isDraggingModal]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    if (!showColorModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 모달 내부 클릭이 아니면 닫기
      if (!target.closest('[data-color-modal]')) {
        setShowColorModal(false);
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
  }, [showColorModal]);

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
        // 기본 색상 사용
        setAvailableColors([
          { name: '검정', value: '#000000' },
          { name: '흰색', value: '#FFFFFF' },
          { name: '핑크', value: '#FF69B4' },
        ]);
        setAllowedCombinations([
          { colors: ['#FFFFFF', '#000000'] },
          { colors: ['#FF69B4', '#000000'] },
        ]);
      }
    };

    loadColorPalette();
  }, []);

  // 색상 조합이 허용되는지 확인 (순서 무관, 같은 색상 불가)
  const isCombinationAllowed = (plateColor: string, qrColor: string): boolean => {
    // 같은 색상은 불가 (대소문자 무시)
    if (plateColor.toUpperCase() === qrColor.toUpperCase()) return false;

    // 대소문자 무시하고 비교
    const plateUpper = plateColor.toUpperCase();
    const qrUpper = qrColor.toUpperCase();

    return allowedCombinations.some(combo =>
      combo.colors.length === 2 &&
      combo.colors.some(c => c.toUpperCase() === plateUpper) &&
      combo.colors.some(c => c.toUpperCase() === qrUpper)
    );
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        platePickerRef.current &&
        !platePickerRef.current.contains(event.target as Node)
      ) {
        setShowPlatePicker(false);
      }
      if (
        qrPickerRef.current &&
        !qrPickerRef.current.contains(event.target as Node)
      ) {
        setShowQrPicker(false);
      }
      if (
        bgPickerRef.current &&
        !bgPickerRef.current.contains(event.target as Node)
      ) {
        setShowBgPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <button
          onClick={() => {
            setShowPlatePicker(!showPlatePicker);
            setShowQrPicker(false);
            setShowBgPicker(false);
          }}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            background: selectedPlate.plateColor,
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
          title="판 색상"
        />
        {showPlatePicker && (
          <>
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
            {availableColors.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  updateSelectedPlateColor(color.value);
                  setShowPlatePicker(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: selectedPlate.plateColor === color.value ? '2px solid #333' : '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: selectedPlate.plateColor === color.value ? '#f5f5f5' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedPlate.plateColor === color.value ? 600 : 400,
                  whiteSpace: 'nowrap',
                  outline: 'none',
                }}
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
              </button>
            ))}

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
                setShowColorModal(true);
                setActiveColorTab('plate');
                setShowPlatePicker(false);
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
              🎨 자유 색상 (미리보기용)
            </button>
          </div>
          </>
        )}
      </div>
      )}

      {/* QR 색상 */}
      {selectedPlate && (
      <div style={{ position: 'relative' }} ref={qrPickerRef}>
        <button
          onClick={() => {
            setShowQrPicker(!showQrPicker);
            setShowPlatePicker(false);
            setShowBgPicker(false);
          }}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            background: selectedPlate.qrColor,
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
          title="QR 색상"
        />
        {showQrPicker && (
          <>
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
              const isAllowed = selectedPlate && isCombinationAllowed(selectedPlate.plateColor, color.value);

              return (
                <button
                  key={color.value}
                  onClick={() => {
                    updateSelectedQrColor(color.value);
                    setShowQrPicker(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: selectedPlate?.qrColor === color.value ? '2px solid #333' : '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedPlate?.qrColor === color.value ? '#f5f5f5' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selectedPlate?.qrColor === color.value ? 600 : 400,
                    whiteSpace: 'nowrap',
                    outline: 'none',
                    opacity: isAllowed ? 1 : 0.5,
                  }}
                  title={!isAllowed ? '출력 불가 조합' : ''}
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
                  {!isAllowed && <span style={{ fontSize: '11px', color: '#ff9800' }}>⚠️</span>}
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
                setShowColorModal(true);
                setActiveColorTab('qr');
                setShowQrPicker(false);
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
              🎨 자유 색상 (미리보기용)
            </button>
          </div>
          </>
        )}
      </div>
      )}

      {/* 배경 색상 */}
      <div style={{ position: 'relative' }} ref={bgPickerRef}>
        <button
          onClick={() => {
            setShowBgPicker(!showBgPicker);
            setShowPlatePicker(false);
            setShowQrPicker(false);
          }}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            background: backgroundColor,
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
          title="배경 색상"
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
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
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
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 20,
              minWidth: '200px',
            }}
          >
            {/* 자유 색상 버튼만 표시 */}
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

      {/* 색상 안내 버튼 - 조합 불가능하면 빨간색 느낌표 */}
      <button
        onClick={() => setShowColorGuide(true)}
        style={{
          width: isMobile ? '32px' : '40px',
          height: isMobile ? '32px' : '40px',
          minWidth: isMobile ? '32px' : '40px',
          minHeight: isMobile ? '32px' : '40px',
          borderRadius: '50%',
          background: selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor)
            ? '#FF5252'
            : '#4CAF50',
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
          const isInvalid = selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor);
          e.currentTarget.style.background = isInvalid ? '#E53935' : '#45a049';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          const isInvalid = selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor);
          e.currentTarget.style.background = isInvalid ? '#FF5252' : '#4CAF50';
        }}
        title={selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor) ? '출력 불가능한 색상 조합' : '색상 안내'}
      >
        {selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor) ? '!' : '?'}
      </button>

      {/* 색상 안내 모달 */}
      {showColorGuide && (
        <ColorGuideModal
          onClose={() => setShowColorGuide(false)}
          currentPlateColor={selectedPlate?.plateColor}
          currentQrColor={selectedPlate?.qrColor}
          availableColors={availableColors}
          allowedCombinations={allowedCombinations}
          colorWarningMessage={colorWarningMessage}
        />
      )}

      {/* 통합 색상 선택 모달 (판, QR, 배경 모두 여기서 처리) */}
      {showColorModal && (
          <div
            data-color-modal
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${colorModalPos.x}px), calc(-50% + ${colorModalPos.y}px))`,
              backgroundColor: 'white',
              padding: '12px',
              paddingTop: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              userSelect: 'none',
              zIndex: 2000,
            }}
            onMouseDown={(e) => {
              setIsDraggingModal(true);
              setDragStart({ x: e.clientX - colorModalPos.x, y: e.clientY - colorModalPos.y });
            }}
            onMouseMove={(e) => {
              if (isDraggingModal) {
                setColorModalPos({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsDraggingModal(false)}
            onMouseLeave={() => setIsDraggingModal(false)}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              setIsDraggingModal(true);
              setDragStart({ x: touch.clientX - colorModalPos.x, y: touch.clientY - colorModalPos.y });
            }}
            onTouchMove={(e) => {
              if (isDraggingModal) {
                const touch = e.touches[0];
                setColorModalPos({
                  x: touch.clientX - dragStart.x,
                  y: touch.clientY - dragStart.y,
                });
              }
            }}
            onTouchEnd={() => setIsDraggingModal(false)}
          >
          {/* 드래그 핸들 영역 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '20px',
              cursor: isDraggingModal ? 'grabbing' : 'grab',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          />

          {/* HexColorPicker만 표시 */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <HexColorPicker
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
              style={{ width: '150px', height: '150px' }}
            />
          </div>
          </div>
      )}
    </div>

    </>
  );
};
