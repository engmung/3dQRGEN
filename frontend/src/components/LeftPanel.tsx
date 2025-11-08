import { useState, useEffect } from 'react';
import { useDesignStore } from '../store/useDesignStore';
import type { QRType } from '../store/useDesignStore';
import { AVAILABLE_FONTS } from '../utils/fontLoader';
import { QRTypeSelector } from './QRTypeSelector';
import { ProductTypeSelector } from './ProductTypeSelector';
import { WiFiForm } from './forms/WiFiForm';
import { EmailForm } from './forms/EmailForm';
import { getPricingSettings, calculatePlatePrice, formatPrice, type PricingSettings } from '../utils/pricing';
import { useIsMobile } from '../hooks/useMediaQuery';

type TabType = 'qr' | 'text' | 'image';

const inputStyle = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box' as const,
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px'
};

const sectionStyle = {
  marginBottom: '20px'
};

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('qr');
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const isMobile = useIsMobile();

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '16px',
    color: '#333',
    ...(isMobile && {
      textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)'
    })
  };

  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const updatePlate = useDesignStore((state) => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);
  const hasPlate = !!selectedPlate;

  // 가격 설정 로드
  useEffect(() => {
    getPricingSettings().then(setPricingSettings);
  }, []);

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
    <div style={{
      width: isMobile ? '100%' : '40%',
      height: isMobile ? 'auto' : 'calc(100vh - 60px)',
      backgroundColor: isMobile ? 'transparent' : '#f8f6f3',
      borderRight: isMobile ? 'none' : '1px solid #e5e0db',
      display: 'flex',
      flexDirection: 'column',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      {/* 탭 헤더 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #ddd',
        gap: isMobile ? '8px' : '0',
        padding: isMobile ? '8px' : '0'
      }}>
        <button
          style={{
            ...tabButtonStyle(activeTab === 'qr'),
            borderRadius: isMobile ? '8px' : '0'
          }}
          onClick={() => setActiveTab('qr')}
        >
          QR
        </button>
        <button
          style={{
            ...tabButtonStyle(activeTab === 'text'),
            borderRadius: isMobile ? '8px' : '0'
          }}
          onClick={() => setActiveTab('text')}
        >
          텍스트
        </button>
        <button
          style={{
            ...tabButtonStyle(activeTab === 'image'),
            borderRight: 'none',
            borderRadius: isMobile ? '8px' : '0'
          }}
          onClick={() => setActiveTab('image')}
        >
          이미지
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isMobile ? '0 12px 0 12px' : '20px',
        backgroundColor: isMobile ? 'transparent' : '#fff',
        position: 'relative'
      }}>
        {/* 선택 안 된 경우 오버레이 */}
        {!hasPlate && (
          <div style={{
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
            gap: '10px'
          }}>
            <div style={{ fontSize: '20px', color: '#999', fontWeight: 600 }}>
              QR 판을 선택하세요
            </div>
            <div style={{ fontSize: '16px', color: '#bbb', fontWeight: 400 }}>
              우측에서 + 버튼을 클릭하여 새 QR 판을 추가할 수 있습니다
            </div>
          </div>
        )}

        {activeTab === 'qr' && selectedPlate && (
          <div>
            {/* 제품 유형 선택 */}
            <ProductTypeSelector />

            {/* 명함 크기 설정 (명함 모드일 때만) */}
            {selectedPlate.productType === 'card' && (
              <div style={sectionStyle}>
                <label style={labelStyle}>명함 크기</label>

                {/* 가로 */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    가로: {selectedPlate.cardWidth}mm
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="1"
                    value={selectedPlate.cardWidth}
                    onChange={(e) => updatePlate(selectedPlate.id, { cardWidth: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* 세로 */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    세로: {selectedPlate.cardHeight}mm
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="1"
                    value={selectedPlate.cardHeight}
                    onChange={(e) => updatePlate(selectedPlate.id, { cardHeight: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* 두께 */}
                <div>
                  <label style={{ fontSize: '14px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    두께: {selectedPlate.cardThickness.toFixed(1)}mm
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={selectedPlate.cardThickness}
                    onChange={(e) => updatePlate(selectedPlate.id, { cardThickness: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* QR 타입 선택 */}
            <div style={sectionStyle}>
              <QRTypeSelector
                value={selectedPlate.qrType}
                onChange={(type: QRType) => updatePlate(selectedPlate.id, { qrType: type })}
              />
            </div>

            {/* QR 데이터 입력 */}
            <div style={sectionStyle}>
              {selectedPlate.qrType === 'url' && (
                <div>
                  <label style={labelStyle}>URL</label>
                  <input
                    type="text"
                    value={selectedPlate.qrUrl}
                    onChange={(e) => updatePlate(selectedPlate.id, { qrUrl: e.target.value })}
                    placeholder="https://example.com"
                    style={inputStyle}
                  />
                </div>
              )}

              {selectedPlate.qrType === 'wifi' && (
                <WiFiForm
                  data={selectedPlate.qrWifiData}
                  onChange={(data) => updatePlate(selectedPlate.id, { qrWifiData: data })}
                />
              )}

              {selectedPlate.qrType === 'email' && (
                <EmailForm
                  data={selectedPlate.qrEmailData}
                  onChange={(data) => updatePlate(selectedPlate.id, { qrEmailData: data })}
                />
              )}
            </div>

            {/* QR 설정 */}
            <div style={sectionStyle}>
              <h3 style={{
                marginTop: 0,
                marginBottom: '15px',
                fontSize: '20px',
                fontWeight: 600,
                color: '#333',
                ...(isMobile && {
                  textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)'
                })
              }}>QR 설정</h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 크기 (mm): {selectedPlate.qrSize.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrSize}
                  onInput={(e) => updatePlate(selectedPlate.id, { qrSize: Number(e.currentTarget.value) })}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  min="20"
                  max={selectedPlate.productType === 'card'
                    ? Math.min(selectedPlate.cardWidth, selectedPlate.cardHeight) - 5
                    : 60}
                  step="0.1"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 두께 (mm): {selectedPlate.qrThickness.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrThickness}
                  onInput={(e) => updatePlate(selectedPlate.id, { qrThickness: Number(e.currentTarget.value) })}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  min="1"
                  max="3"
                  step="0.01"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 높이 (mm): {selectedPlate.qrHeightOffset.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrHeightOffset}
                  onInput={(e) => updatePlate(selectedPlate.id, { qrHeightOffset: Number(e.currentTarget.value) })}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  min={selectedPlate.productType === 'card'
                    ? -(selectedPlate.cardHeight - selectedPlate.qrSize) / 2
                    : -50}
                  max={selectedPlate.productType === 'card'
                    ? (selectedPlate.cardHeight - selectedPlate.qrSize) / 2
                    : 30}
                  step="0.01"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 좌우 (mm): {selectedPlate.qrHorizontalOffset.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrHorizontalOffset}
                  onInput={(e) => updatePlate(selectedPlate.id, { qrHorizontalOffset: Number(e.currentTarget.value) })}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  min={selectedPlate.productType === 'card'
                    ? -(selectedPlate.cardWidth - selectedPlate.qrSize) / 2
                    : -(60 - selectedPlate.qrSize) / 2}
                  max={selectedPlate.productType === 'card'
                    ? (selectedPlate.cardWidth - selectedPlate.qrSize) / 2
                    : (60 - selectedPlate.qrSize) / 2}
                  step="0.01"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'text' && selectedPlate && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 내용</label>
              <input
                type="text"
                value={selectedPlate.text}
                onChange={(e) => updatePlate(selectedPlate.id, { text: e.target.value })}
                placeholder="텍스트 입력 (선택사항)"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>폰트</label>
              <select
                value={selectedPlate.textFont}
                onChange={(e) => updatePlate(selectedPlate.id, { textFont: e.target.value })}
                style={inputStyle}
              >
                {Object.entries(AVAILABLE_FONTS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 크기 (mm): {selectedPlate.textSize.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.textSize}
                onInput={(e) => updatePlate(selectedPlate.id, { textSize: Number(e.currentTarget.value) })}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                min="2"
                max="30"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 높이 (mm): {selectedPlate.textHeightOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.textHeightOffset}
                onInput={(e) => updatePlate(selectedPlate.id, { textHeightOffset: Number(e.currentTarget.value) })}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                min={selectedPlate.productType === 'card'
                  ? -selectedPlate.cardHeight / 2
                  : -50}
                max={selectedPlate.productType === 'card'
                  ? selectedPlate.cardHeight / 2
                  : 70}
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 좌우 (mm): {selectedPlate.textHorizontalOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.textHorizontalOffset}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onInput={(e) => updatePlate(selectedPlate.id, { textHorizontalOffset: Number(e.currentTarget.value) })}
                min={selectedPlate.productType === 'card'
                  ? -selectedPlate.cardWidth / 2
                  : -30}
                max={selectedPlate.productType === 'card'
                  ? selectedPlate.cardWidth / 2
                  : 30}
                step="0.01"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'image' && selectedPlate && (
          <div>
            {/* 프리셋 이미지 선택 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>프리셋 이미지 추가</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={async () => {
                    const response = await fetch('/images/insta.png');
                    const blob = await response.blob();
                    const file = new File([blob], 'insta.png', { type: 'image/png' });
                    useDesignStore.getState().addImage(selectedPlate.id, file);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    outline: 'none',
                  }}
                >
                  <img src="/images/insta.png" alt="Instagram" style={{ width: '32px', height: '32px' }} />
                  <span>Instagram</span>
                </button>
                <button
                  onClick={async () => {
                    const response = await fetch('/images/wifi.png');
                    const blob = await response.blob();
                    const file = new File([blob], 'wifi.png', { type: 'image/png' });
                    useDesignStore.getState().addImage(selectedPlate.id, file);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '2px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    outline: 'none',
                  }}
                >
                  <img src="/images/wifi.png" alt="WiFi" style={{ width: '32px', height: '32px' }} />
                  <span>WiFi</span>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>또는 직접 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    useDesignStore.getState().addImage(selectedPlate.id, file);
                    e.target.value = ''; // Reset input
                  }
                }}
                style={inputStyle}
              />
            </div>

            {/* 이미지 리스트 */}
            {selectedPlate.images.map((img, index) => (
              <div key={img.id} style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: isMobile ? 'rgba(245, 245, 245, 0.3)' : '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>이미지 {index + 1}</span>
                  <button
                    onClick={() => useDesignStore.getState().removeImage(selectedPlate.id, img.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  >
                    제거
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  {img.file.name}
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ ...labelStyle, fontSize: '14px' }}>크기 (mm): {img.size.toFixed(1)}</label>
                  <input
                    type="range"
                    value={img.size}
                    onInput={(e) => useDesignStore.getState().updateImage(selectedPlate.id, img.id, { size: Number(e.currentTarget.value) })}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    min="3"
                    max={selectedPlate.productType === 'card'
                      ? Math.min(selectedPlate.cardWidth, selectedPlate.cardHeight) - 5
                      : 60}
                    step="0.1"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ ...labelStyle, fontSize: '14px' }}>높이 (mm): {img.heightOffset.toFixed(1)}</label>
                  <input
                    type="range"
                    value={img.heightOffset}
                    onInput={(e) => useDesignStore.getState().updateImage(selectedPlate.id, img.id, { heightOffset: Number(e.currentTarget.value) })}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    min={selectedPlate.productType === 'card'
                      ? -(selectedPlate.cardHeight - img.size) / 2
                      : -50}
                    max={selectedPlate.productType === 'card'
                      ? (selectedPlate.cardHeight - img.size) / 2
                      : 70}
                    step="0.01"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '0' }}>
                  <label style={{ ...labelStyle, fontSize: '14px' }}>좌우 (mm): {img.horizontalOffset.toFixed(1)}</label>
                  <input
                    type="range"
                    value={img.horizontalOffset}
                    onInput={(e) => useDesignStore.getState().updateImage(selectedPlate.id, img.id, { horizontalOffset: Number(e.currentTarget.value) })}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    min={selectedPlate.productType === 'card'
                      ? -(selectedPlate.cardWidth - img.size) / 2
                      : -30}
                    max={selectedPlate.productType === 'card'
                      ? (selectedPlate.cardWidth - img.size) / 2
                      : 30}
                    step="0.01"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            ))}

            {selectedPlate.images.length === 0 && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#999',
                fontSize: '14px',
              }}>
                이미지를 추가하세요
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
