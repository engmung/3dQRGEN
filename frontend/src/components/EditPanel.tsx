import { useDesignStore } from '../store/useDesignStore';
import type { QRType } from '../store/useDesignStore';
import { AVAILABLE_FONTS, type FontKey } from '../utils/fontLoader';
import { QRTypeSelector } from './QRTypeSelector';
import { WiFiForm } from './forms/WiFiForm';
import { EmailForm } from './forms/EmailForm';

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
  marginBottom: '25px',
  paddingBottom: '20px',
  borderBottom: '1px solid #ddd'
};

export function EditPanel() {
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const updatePlate = useDesignStore((state) => state.updatePlate);
  const removePlate = useDesignStore((state) => state.removePlate);
  const selectPlate = useDesignStore((state) => state.selectPlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);

  if (!selectedPlate) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: '60px', // 헤더 높이만큼 아래에서 시작
        width: '360px',
        height: 'calc(100vh - 60px)', // 헤더 높이를 뺀 높이
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
        animation: 'slideIn 0.3s ease-out',
        zIndex: 50,
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>

      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>QR 판 편집</h2>
        <button
          onClick={() => selectPlate(null)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#ddd')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
        >
          ×
        </button>
      </div>

      {/* QR 타입 선택 */}
      <div style={sectionStyle}>
        <QRTypeSelector
          value={selectedPlate.qrType}
          onChange={(type: QRType) => updatePlate(selectedPlate.id, { qrType: type })}
        />
      </div>

      {/* QR 데이터 입력 (타입에 따라 다른 폼 표시) */}
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
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            범위: {(-(60 - selectedPlate.qrSize) / 2).toFixed(1)} ~ {((60 - selectedPlate.qrSize) / 2).toFixed(1)}mm
          </div>
        </div>
      </div>

      {/* 텍스트 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>텍스트 설정</h3>

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

      {/* 이미지 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>이미지 설정</h3>

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
            max="80"
            step="0.5"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>이미지 높이 (mm): {selectedPlate.imageHeightOffset.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.imageHeightOffset}
            onChange={(e) => updatePlate(selectedPlate.id, { imageHeightOffset: Number(e.target.value) })}
            min="-50"
            max="70"
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
            min={-(60 - selectedPlate.imageSize) / 2}
            max={(60 - selectedPlate.imageSize) / 2}
            step="0.1"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            범위: {(-(60 - selectedPlate.imageSize) / 2).toFixed(1)} ~ {((60 - selectedPlate.imageSize) / 2).toFixed(1)}mm
          </div>
        </div>
      </div>

      {/* 색상 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px' }}>색상</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>판 색상</label>
          <input
            type="color"
            value={selectedPlate.plateColor}
            onChange={(e) => updatePlate(selectedPlate.id, { plateColor: e.target.value })}
            style={{ ...inputStyle, height: '40px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR/텍스트/이미지 색상</label>
          <input
            type="color"
            value={selectedPlate.qrColor}
            onChange={(e) => updatePlate(selectedPlate.id, { qrColor: e.target.value })}
            style={{ ...inputStyle, height: '40px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 삭제 버튼 */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => {
            if (confirm('이 QR 판을 삭제하시겠습니까?')) {
              removePlate(selectedPlate.id);
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#d32f2f')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#f44336')}
        >
          판 삭제
        </button>
      </div>
    </div>
  );
}
