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
          <label style={labelStyle}>QR 색상</label>
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
