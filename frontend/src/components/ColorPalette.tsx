import { useState, useEffect, useRef } from 'react';
import { useDesignStore } from '../store/useDesignStore';

// 사용 가능한 필라멘트 색상
const FILAMENT_COLORS = [
  { name: '검정', value: '#000000' },
  { name: '흰색', value: '#FFFFFF' },
  { name: '핑크', value: '#FF69B4' },
];

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

  const platePickerRef = useRef<HTMLDivElement>(null);
  const qrPickerRef = useRef<HTMLDivElement>(null);
  const bgPickerRef = useRef<HTMLDivElement>(null);

  // 선택된 판이 없으면 배경 색상만 표시
  const selectedPlate = selectedPlateId ? plates.find(p => p.id === selectedPlateId) : null;

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
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {FILAMENT_COLORS.map((color) => (
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
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {FILAMENT_COLORS.map((color) => (
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
                  border: selectedPlate.qrColor === color.value ? '2px solid #333' : '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: selectedPlate.qrColor === color.value ? '#f5f5f5' : 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedPlate.qrColor === color.value ? 600 : 400,
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
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#666',
                textAlign: 'center',
              }}
            >
              {backgroundColor}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
