import { useDesignStore } from '../store/useDesignStore';
import { useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import QRCode from 'qrcode';

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

interface SidePanelProps {
  onExportSTL: () => void;
}

export function SidePanel({ onExportSTL }: SidePanelProps) {
  const store = useDesignStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isSignedIn } = useUser();

  // QR 미리보기
  useEffect(() => {
    if (store.qrUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, store.qrUrl, { width: 200, margin: 2 }, (error) => {
        if (error) console.error('QR Error:', error);
      });
    }
  }, [store.qrUrl]);

  return (
    <div style={{
      width: '320px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderLeft: '1px solid #ddd',
      height: '100vh',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>커스터마이징</h2>

      {/* 거치대 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>거치대 설정</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>거치대 각도</label>
          <select
            value={store.standAngle}
            onChange={(e) => store.setStandAngle(Number(e.target.value))}
            style={inputStyle}
          >
            <option value={90}>90° 거치대</option>
            <option value={95}>95° 거치대</option>
            <option value={100}>100° 거치대 (추천)</option>
            <option value={105}>105° 거치대</option>
            <option value={110}>110° 거치대</option>
          </select>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            판 너비에 맞춰 자동 조절됩니다
          </div>
        </div>
      </div>

      {/* 디버그: QR 판 위치 조절 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>🛠️ 디버그: QR 판 위치</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>Position Y</label>
          <input
            type="range"
            value={store.qrPlatePositionY}
            onChange={(e) => store.setQrPlatePositionY(Number(e.target.value))}
            min="-50"
            max="100"
            step="0.5"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>{store.qrPlatePositionY.toFixed(1)} mm</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Position Z</label>
          <input
            type="range"
            value={store.qrPlatePositionZ}
            onChange={(e) => store.setQrPlatePositionZ(Number(e.target.value))}
            min="-50"
            max="100"
            step="0.5"
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>{store.qrPlatePositionZ.toFixed(1)} mm</div>
        </div>

        <button
          onClick={() => store.resetQrPlateTransform()}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 리셋
        </button>
      </div>

      {/* QR URL 입력 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>QR 코드</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>URL 입력</label>
          <input
            type="text"
            value={store.qrUrl}
            onChange={(e) => store.setQrUrl(e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 크기 (mm)</label>
          <input
            type="number"
            value={store.qrSize}
            onChange={(e) => store.setQrSize(Number(e.target.value))}
            min="10"
            max="200"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 두께 (mm)</label>
          <input
            type="number"
            value={store.qrDepth}
            onChange={(e) => store.setQrDepth(Number(e.target.value))}
            min="0.5"
            max="10"
            step="0.5"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>판 상단에서 거리 (mm)</label>
          <input
            type="number"
            value={store.qrYOffset}
            onChange={(e) => store.setQrYOffset(Number(e.target.value))}
            min="0"
            max="100"
            step="1"
            style={inputStyle}
          />
        </div>
      </div>

      {/* 판 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>판 크기</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>너비 (mm)</label>
          <input
            type="number"
            value={store.plateWidth}
            onChange={(e) => store.setPlateWidth(Number(e.target.value))}
            min="20"
            max="300"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>높이 (mm)</label>
          <input
            type="number"
            value={store.plateHeight}
            onChange={(e) => store.setPlateHeight(Number(e.target.value))}
            min="20"
            max="300"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>두께 (mm)</label>
          <input
            type="number"
            value={store.plateDepth}
            onChange={(e) => store.setPlateDepth(Number(e.target.value))}
            min="1"
            max="20"
            step="0.5"
            style={inputStyle}
          />
        </div>
      </div>

      {/* STL Export */}
      <div style={{ marginBottom: '25px' }}>
        <button
          onClick={() => {
            if (!isSignedIn) {
              alert('주문하려면 먼저 로그인해주세요.');
              return;
            }
            onExportSTL();
          }}
          disabled={!store.qrUrl || !isSignedIn}
          style={{
            width: '100%',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: (store.qrUrl && isSignedIn) ? '#4CAF50' : '#cccccc',
            border: 'none',
            borderRadius: '4px',
            cursor: (store.qrUrl && isSignedIn) ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (store.qrUrl && isSignedIn) {
              e.currentTarget.style.backgroundColor = '#45a049';
            }
          }}
          onMouseLeave={(e) => {
            if (store.qrUrl && isSignedIn) {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }
          }}
        >
          🛒 주문하기
        </button>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
          {!isSignedIn
            ? '주문하려면 로그인이 필요합니다'
            : store.qrUrl
              ? '주문 정보가 백엔드로 전송됩니다'
              : 'QR 코드를 먼저 생성하세요'}
        </div>
      </div>

      {/* 디버그 미리보기 */}
      {store.qrUrl && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#888' }}>
            디버그: QR 미리보기
          </div>
          <canvas ref={canvasRef} style={{ border: '1px solid #ccc', width: '100%' }} />
        </div>
      )}
    </div>
  );
}
