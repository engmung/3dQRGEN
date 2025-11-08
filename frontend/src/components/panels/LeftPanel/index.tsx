import { useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { QRTab } from './QRTab';
import { TextTab } from './TextTab';
import { ImageTab } from './ImageTab';

type TabType = 'qr' | 'text' | 'image';

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('qr');
  const isMobile = useIsMobile();

  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);

  const selectedPlate = plates.find((p) => p.id === selectedPlateId);
  const hasPlate = !!selectedPlate;

  const tabButtonStyle = (isActive: boolean) => ({
    flex: 1,
    padding: isMobile ? '10px 8px' : '12px',
    backgroundColor: isActive ? '#fff' : '#f0ede9',
    border: 'none',
    borderRight: '1px solid #e5e0db',
    cursor: 'pointer',
    fontSize: isMobile ? '15px' : '18px',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s',
    outline: 'none',
  });

  return (
    <div
      style={{
        width: isMobile ? '100%' : '40%',
        height: isMobile ? 'auto' : 'calc(100vh - 60px)',
        backgroundColor: isMobile ? 'transparent' : '#f8f6f3',
        borderRight: isMobile ? 'none' : '1px solid #e5e0db',
        display: 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'visible' : 'hidden',
      }}
    >
      {/* 탭 헤더 */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #ddd',
          gap: isMobile ? '8px' : '0',
          padding: isMobile ? '8px' : '0',
        }}
      >
        <button
          style={{
            ...tabButtonStyle(activeTab === 'qr'),
            borderRadius: isMobile ? '8px' : '0',
          }}
          onClick={() => setActiveTab('qr')}
        >
          QR
        </button>
        <button
          style={{
            ...tabButtonStyle(activeTab === 'text'),
            borderRadius: isMobile ? '8px' : '0',
          }}
          onClick={() => setActiveTab('text')}
        >
          텍스트
        </button>
        <button
          style={{
            ...tabButtonStyle(activeTab === 'image'),
            borderRight: 'none',
            borderRadius: isMobile ? '8px' : '0',
          }}
          onClick={() => setActiveTab('image')}
        >
          이미지
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '0 12px 0 12px' : '20px',
          backgroundColor: isMobile ? 'transparent' : '#fff',
          position: 'relative',
        }}
      >
        {/* 선택 안 된 경우 오버레이 */}
        {!hasPlate && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '20px', color: '#999', fontWeight: 600 }}>
              QR 판을 선택하세요
            </div>
            <div style={{ fontSize: '16px', color: '#bbb', fontWeight: 400 }}>
              우측에서 + 버튼을 클릭하여 새 QR 판을 추가할 수 있습니다
            </div>
          </div>
        )}

        {activeTab === 'qr' && selectedPlate && <QRTab plate={selectedPlate} />}
        {activeTab === 'text' && selectedPlate && <TextTab plate={selectedPlate} />}
        {activeTab === 'image' && selectedPlate && <ImageTab plate={selectedPlate} />}
      </div>
    </div>
  );
}
