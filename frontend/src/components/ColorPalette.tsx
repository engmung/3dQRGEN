import { useState, useEffect, useRef } from 'react';
import { useDesignStore } from '../store/useDesignStore';
import { getPricingSettings } from '../utils/pricing';
import { ColorGuideModal } from './ColorGuideModal';

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

  const [showPlatePicker, setShowPlatePicker] = useState(false);
  const [showQrPicker, setShowQrPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showColorGuide, setShowColorGuide] = useState(false);

  // 색상 시스템 (API에서 로드)
  const [availableColors, setAvailableColors] = useState<ColorInfo[]>([]);
  const [allowedCombinations, setAllowedCombinations] = useState<ColorCombination[]>([]);
  const [colorWarningMessage, setColorWarningMessage] = useState<string>('');

  const platePickerRef = useRef<HTMLDivElement>(null);
  const qrPickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  // 선택된 판이 없으면 배경 색상만 표시
  const selectedPlate = selectedPlateId ? plates.find(p => p.id === selectedPlateId) : null;

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
    // 같은 색상은 불가
    if (plateColor === qrColor) return false;

    return allowedCombinations.some(combo =>
      combo.colors.length === 2 &&
      combo.colors.includes(plateColor) &&
      combo.colors.includes(qrColor)
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
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '10px 20px',
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          backdropFilter: 'blur(10px)',
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
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '50%',
            background: selectedPlate.plateColor,
            border: '3px solid #ddd',
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
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 1000,
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

            {/* 자유 색상 섹션 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 600,
                }}
              >
                자유 색상 (미리보기용)
              </div>
              <input
                type="color"
                value={selectedPlate.plateColor}
                onChange={(e) => updateSelectedPlateColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
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
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '50%',
            background: selectedPlate.qrColor,
            border: '3px solid #ddd',
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
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 1000,
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

            {/* 자유 색상 섹션 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 600,
                }}
              >
                자유 색상 (미리보기용)
              </div>
              <input
                type="color"
                value={selectedPlate.qrColor}
                onChange={(e) => updateSelectedQrColor(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
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
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            borderRadius: '50%',
            background: backgroundColor,
            border: '3px solid #ddd',
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
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{
                width: '100px',
                height: '40px',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        )}
      </div>

      {/* 색상 안내 버튼 */}
      <button
        onClick={() => setShowColorGuide(true)}
        style={{
          width: '40px',
          height: '40px',
          minWidth: '40px',
          minHeight: '40px',
          borderRadius: '50%',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s, background 0.2s',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = '#45a049';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = '#4CAF50';
        }}
        title="색상 안내"
      >
        ?
      </button>
    </div>

    {/* 색상 조합 경고 배너 */}
    {selectedPlate && !isCombinationAllowed(selectedPlate.plateColor, selectedPlate.qrColor) && (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#ff9800',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        ⚠️ 이 조합은 출력 불가능합니다
      </div>
    )}
    </>
  );
};
