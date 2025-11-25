/**
 * 색상 팔레트 메인 컴포넌트
 * 백엔드 연결 제거, 자유 색상 선택만 지원
 */

import { useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { ColorGuideModal } from '../../ColorGuideModal';
import { ColorPickerModal } from '../ColorPickerModal';
import { useIsMobile } from '../../../hooks/useMediaQuery';

type ColorType = 'plate' | 'qr' | 'bg';

// 색상 버튼 컴포넌트
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
  const [showColorGuide, setShowColorGuide] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<ColorType>('plate');

  return (
    <>
      {showColorGuide && (
        <ColorGuideModal
          onClose={() => setShowColorGuide(false)}
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
          <ColorButton
            color={selectedPlate.plateColor}
            onClick={() => {
              setShowColorModal(true);
              setActiveColorTab('plate');
            }}
            title="Plate Color"
            isMobile={isMobile}
          />
        )}

        {/* QR 색상 */}
        {selectedPlate && (
          <ColorButton
            color={selectedPlate.qrColor}
            onClick={() => {
              setShowColorModal(true);
              setActiveColorTab('qr');
            }}
            title="QR Color"
            isMobile={isMobile}
          />
        )}

        {/* 배경 색상 */}
        <ColorButton
          color={backgroundColor}
          onClick={() => {
            setShowColorModal(true);
            setActiveColorTab('bg');
          }}
          title="Background Color"
          isMobile={isMobile}
        />

        {/* 색상 안내 버튼 */}
        <button
          onClick={() => setShowColorGuide(true)}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
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
            fontSize: isMobile ? '16px' : '20px',
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
          title="Color Guide"
        >
          ?
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
