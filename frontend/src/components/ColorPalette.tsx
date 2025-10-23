import { useState } from 'react';
import { useDesignStore } from '../store/useDesignStore';

export const ColorPalette = () => {
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const updateSelectedPlateColor = useDesignStore((state) => state.updateSelectedPlateColor);
  const updateSelectedQrColor = useDesignStore((state) => state.updateSelectedQrColor);

  const [showPlatePicker, setShowPlatePicker] = useState(false);
  const [showQrPicker, setShowQrPicker] = useState(false);

  // 선택된 판이 없으면 아무것도 표시하지 않음
  if (!selectedPlateId) {
    return null;
  }

  const selectedPlate = plates.find(p => p.id === selectedPlateId);
  if (!selectedPlate) {
    return null;
  }

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
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowPlatePicker(!showPlatePicker);
            setShowQrPicker(false);
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: selectedPlate.plateColor,
            border: '3px solid #ddd',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
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
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <input
              type="color"
              value={selectedPlate.plateColor}
              onChange={(e) => updateSelectedPlateColor(e.target.value)}
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
              {selectedPlate.plateColor}
            </div>
          </div>
        )}
      </div>

      {/* QR 색상 */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowQrPicker(!showQrPicker);
            setShowPlatePicker(false);
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: selectedPlate.qrColor,
            border: '3px solid #ddd',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
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
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <input
              type="color"
              value={selectedPlate.qrColor}
              onChange={(e) => updateSelectedQrColor(e.target.value)}
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
              {selectedPlate.qrColor}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
