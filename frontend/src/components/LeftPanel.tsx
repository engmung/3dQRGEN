import { useState } from 'react';
import { useDesignStore } from '../store/useDesignStore';
import type { QRType } from '../store/useDesignStore';
import { AVAILABLE_FONTS } from '../utils/fontLoader';
import { QRTypeSelector } from './QRTypeSelector';
import { WiFiForm } from './forms/WiFiForm';
import { EmailForm } from './forms/EmailForm';
import { ColorPalette } from './ColorPalette';

type TabType = 'qr' | 'text' | 'image';

const inputStyle = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box' as const,
  border: '1px solid #ccc',
  borderRadius: '4px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  fontSize: '14px'
};

const sectionStyle = {
  marginBottom: '20px'
};

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('qr');
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const updatePlate = useDesignStore((state) => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);
  const hasPlate = !!selectedPlate;

  const tabButtonStyle = (isActive: boolean) => ({
    flex: 1,
    padding: '12px',
    backgroundColor: isActive ? '#fff' : '#e0e0e0',
    border: 'none',
    borderBottom: isActive ? 'none' : '2px solid #ccc',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
  });

  return (
    <div style={{
      width: '40%',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#f5f5f5',
      borderRight: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 탭 헤더 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ccc' }}>
        <button
          style={tabButtonStyle(activeTab === 'qr')}
          onClick={() => setActiveTab('qr')}
          onMouseOver={(e) => !( activeTab === 'qr') && (e.currentTarget.style.backgroundColor = '#d0d0d0')}
          onMouseOut={(e) => !(activeTab === 'qr') && (e.currentTarget.style.backgroundColor = '#e0e0e0')}
        >
          QR
        </button>
        <button
          style={tabButtonStyle(activeTab === 'text')}
          onClick={() => setActiveTab('text')}
          onMouseOver={(e) => !(activeTab === 'text') && (e.currentTarget.style.backgroundColor = '#d0d0d0')}
          onMouseOut={(e) => !(activeTab === 'text') && (e.currentTarget.style.backgroundColor = '#e0e0e0')}
        >
          텍스트
        </button>
        <button
          style={tabButtonStyle(activeTab === 'image')}
          onClick={() => setActiveTab('image')}
          onMouseOver={(e) => !(activeTab === 'image') && (e.currentTarget.style.backgroundColor = '#d0d0d0')}
          onMouseOut={(e) => !(activeTab === 'image') && (e.currentTarget.style.backgroundColor = '#e0e0e0')}
        >
          이미지
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#fff',
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
            <div style={{ fontSize: '18px', color: '#999', fontWeight: 'bold' }}>
              QR 판을 선택하세요
            </div>
            <div style={{ fontSize: '14px', color: '#bbb' }}>
              우측에서 + 버튼을 클릭하여 새 QR 판을 추가할 수 있습니다
            </div>
          </div>
        )}

        {activeTab === 'qr' && selectedPlate && (
          <div>
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
              <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>QR 설정</h3>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 크기 (mm): {selectedPlate.qrSize.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrSize}
                  onChange={(e) => updatePlate(selectedPlate.id, { qrSize: Number(e.target.value) })}
                  min="20"
                  max="60"
                  step="1"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 두께 (mm): {selectedPlate.qrThickness.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrThickness}
                  onChange={(e) => updatePlate(selectedPlate.id, { qrThickness: Number(e.target.value) })}
                  min="1"
                  max="3"
                  step="0.1"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 높이 (mm): {selectedPlate.qrHeightOffset.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrHeightOffset}
                  onChange={(e) => updatePlate(selectedPlate.id, { qrHeightOffset: Number(e.target.value) })}
                  min="-50"
                  max="30"
                  step="0.1"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>QR 좌우 (mm): {selectedPlate.qrHorizontalOffset.toFixed(1)}</label>
                <input
                  type="range"
                  value={selectedPlate.qrHorizontalOffset}
                  onChange={(e) => updatePlate(selectedPlate.id, { qrHorizontalOffset: Number(e.target.value) })}
                  min={-(60 - selectedPlate.qrSize) / 2}
                  max={(60 - selectedPlate.qrSize) / 2}
                  step="0.1"
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
                onChange={(e) => updatePlate(selectedPlate.id, { textSize: Number(e.target.value) })}
                min="5"
                max="30"
                step="0.5"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 높이 (mm): {selectedPlate.textHeightOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.textHeightOffset}
                onChange={(e) => updatePlate(selectedPlate.id, { textHeightOffset: Number(e.target.value) })}
                min="-50"
                max="70"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>텍스트 좌우 (mm): {selectedPlate.textHorizontalOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.textHorizontalOffset}
                onChange={(e) => updatePlate(selectedPlate.id, { textHorizontalOffset: Number(e.target.value) })}
                min="-30"
                max="30"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'image' && selectedPlate && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>이미지 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updatePlate(selectedPlate.id, { imageFile: file });
                  }
                }}
                style={inputStyle}
              />
              {selectedPlate.imageFile && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  파일: {selectedPlate.imageFile.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>이미지 크기 (mm): {selectedPlate.imageSize.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.imageSize}
                onChange={(e) => updatePlate(selectedPlate.id, { imageSize: Number(e.target.value) })}
                min="10"
                max="60"
                step="1"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>이미지 높이 (mm): {selectedPlate.imageHeightOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.imageHeightOffset}
                onChange={(e) => updatePlate(selectedPlate.id, { imageHeightOffset: Number(e.target.value) })}
                min="-30"
                max="60"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>이미지 좌우 (mm): {selectedPlate.imageHorizontalOffset.toFixed(1)}</label>
              <input
                type="range"
                value={selectedPlate.imageHorizontalOffset}
                onChange={(e) => updatePlate(selectedPlate.id, { imageHorizontalOffset: Number(e.target.value) })}
                min="-30"
                max="30"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 하단: 색상 팔레트 */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#fafafa'
      }}>
        <ColorPalette />
      </div>
    </div>
  );
}
