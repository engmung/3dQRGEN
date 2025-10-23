import { useDesignStore } from '../store/useDesignStore';

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
        right: 0,
        top: 0,
        width: '360px',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        borderLeft: '1px solid #ddd',
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
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

      {/* QR URL */}
      <div style={sectionStyle}>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR URL</label>
          <input
            type="text"
            value={selectedPlate.qrUrl}
            onChange={(e) => updatePlate(selectedPlate.id, { qrUrl: e.target.value })}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>
      </div>

      {/* 거치대 각도 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>거치대 각도</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[90, 95, 100, 105, 110].map(angle => (
            <button
              key={angle}
              onClick={() => updatePlate(selectedPlate.id, { standAngle: angle as any })}
              style={{
                padding: '8px 16px',
                border: selectedPlate.standAngle === angle ? '2px solid #4CAF50' : '1px solid #ccc',
                borderRadius: '4px',
                background: selectedPlate.standAngle === angle ? '#e8f5e9' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedPlate.standAngle === angle ? 'bold' : 'normal',
              }}
            >
              {angle}°
            </button>
          ))}
        </div>
      </div>

      {/* 판 크기 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>판 크기</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>너비 (mm): {selectedPlate.plateWidth.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.plateWidth}
            onChange={(e) => {
              const newWidth = Number(e.target.value);
              const updates: any = { plateWidth: newWidth };

              // QR 크기 제한 체크
              const maxQRSize = Math.min(newWidth, selectedPlate.plateHeight);
              if (selectedPlate.qrSize > maxQRSize) {
                updates.qrSize = maxQRSize;
              }

              // 아치 곡률 제한 체크
              const maxArch = Math.min(50, newWidth / 2 - 1);
              if (selectedPlate.topArchRadius > maxArch) {
                updates.topArchRadius = maxArch;
              }

              // 판 상단에서 거리 제한 체크
              const maxYOffset = Math.max(0, selectedPlate.plateHeight - (updates.qrSize || selectedPlate.qrSize) - 10);
              if (selectedPlate.qrYOffset > maxYOffset) {
                updates.qrYOffset = maxYOffset;
              }

              updatePlate(selectedPlate.id, updates);
            }}
            min="20.0"
            max="160.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>높이 (mm): {selectedPlate.plateHeight.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.plateHeight}
            onChange={(e) => {
              const newHeight = Number(e.target.value);
              const updates: any = { plateHeight: newHeight };

              // QR 크기 제한 체크
              const maxQRSize = Math.min(selectedPlate.plateWidth, newHeight);
              if (selectedPlate.qrSize > maxQRSize) {
                updates.qrSize = maxQRSize;
              }

              // 판 상단에서 거리 제한 체크
              const maxYOffset = Math.max(0, newHeight - (updates.qrSize || selectedPlate.qrSize) - 10);
              if (selectedPlate.qrYOffset > maxYOffset) {
                updates.qrYOffset = maxYOffset;
              }

              updatePlate(selectedPlate.id, updates);
            }}
            min="20.0"
            max="160.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>깊이 (mm): {selectedPlate.plateDepth.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.plateDepth}
            onChange={(e) => updatePlate(selectedPlate.id, { plateDepth: Number(e.target.value) })}
            min="0.6"
            max="10.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>
      </div>

      {/* QR 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>QR 설정</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 크기 (mm): {selectedPlate.qrSize.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.qrSize}
            onChange={(e) => {
              const newQRSize = Number(e.target.value);
              const updates: any = { qrSize: newQRSize };

              // 판 상단에서 거리 제한 체크
              const maxYOffset = Math.max(0, selectedPlate.plateHeight - newQRSize - 10);
              if (selectedPlate.qrYOffset > maxYOffset) {
                updates.qrYOffset = maxYOffset;
              }

              updatePlate(selectedPlate.id, updates);
            }}
            min="10.0"
            max={Math.min(selectedPlate.plateWidth, selectedPlate.plateHeight)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 두께 (mm): {selectedPlate.qrDepth.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.qrDepth}
            onChange={(e) => updatePlate(selectedPlate.id, { qrDepth: Number(e.target.value) })}
            min="0.6"
            max="10.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>판 상단에서 거리 (mm): {selectedPlate.qrYOffset.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.qrYOffset}
            onChange={(e) => updatePlate(selectedPlate.id, { qrYOffset: Number(e.target.value) })}
            min="0.0"
            max={Math.max(0, selectedPlate.plateHeight - selectedPlate.qrSize - 10)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>상단 아치 곡률 (mm): {selectedPlate.topArchRadius.toFixed(1)}</label>
          <input
            type="range"
            value={selectedPlate.topArchRadius}
            onChange={(e) => updatePlate(selectedPlate.id, { topArchRadius: Number(e.target.value) })}
            min="0.0"
            max={Math.min(50, selectedPlate.plateWidth / 2 - 1)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
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
