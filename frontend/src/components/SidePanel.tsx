import { useDesignStore } from '../store/useDesignStore';
import { useUser } from '@clerk/clerk-react';

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
  onExportOBJ: () => void;
}

export function SidePanel({ onExportOBJ }: SidePanelProps) {
  const store = useDesignStore();
  const { isSignedIn } = useUser();

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

      {/* 판 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>판 크기</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>너비 (mm): {store.plateWidth.toFixed(1)}</label>
          <input
            type="range"
            value={store.plateWidth}
            onChange={(e) => {
              const newWidth = Number(e.target.value);
              store.setPlateWidth(newWidth);

              // QR 크기 제한 체크
              const maxQRSize = Math.min(newWidth, store.plateHeight);
              if (store.qrSize > maxQRSize) {
                store.setQrSize(maxQRSize);
              }

              // 아치 곡률 제한 체크
              const maxArch = Math.min(50, newWidth / 2 - 1);
              if (store.topArchRadius > maxArch) {
                store.setTopArchRadius(maxArch);
              }
            }}
            min="20.0"
            max="160.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>높이 (mm): {store.plateHeight.toFixed(1)}</label>
          <input
            type="range"
            value={store.plateHeight}
            onChange={(e) => {
              const newHeight = Number(e.target.value);
              store.setPlateHeight(newHeight);

              // QR 크기 제한 체크
              const maxQRSize = Math.min(store.plateWidth, newHeight);
              if (store.qrSize > maxQRSize) {
                store.setQrSize(maxQRSize);
              }

              // 판 상단에서 거리 제한 체크
              const maxYOffset = Math.max(0, newHeight - store.qrSize - 10);
              if (store.qrYOffset > maxYOffset) {
                store.setQrYOffset(maxYOffset);
              }
            }}
            min="20.0"
            max="160.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>
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
          <label style={labelStyle}>QR 크기 (mm): {store.qrSize.toFixed(1)}</label>
          <input
            type="range"
            value={store.qrSize}
            onChange={(e) => {
              const newQRSize = Number(e.target.value);
              store.setQrSize(newQRSize);

              // 판 상단에서 거리 제한 체크
              const maxYOffset = Math.max(0, store.plateHeight - newQRSize - 10);
              if (store.qrYOffset > maxYOffset) {
                store.setQrYOffset(maxYOffset);
              }
            }}
            min="10.0"
            max={Math.min(store.plateWidth, store.plateHeight)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 두께 (mm): {store.qrDepth.toFixed(1)}</label>
          <input
            type="range"
            value={store.qrDepth}
            onChange={(e) => store.setQrDepth(Number(e.target.value))}
            min="0.6"
            max="5.0"
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>판 상단에서 거리 (mm): {store.qrYOffset.toFixed(1)}</label>
          <input
            type="range"
            value={store.qrYOffset}
            onChange={(e) => store.setQrYOffset(Number(e.target.value))}
            min="0.0"
            max={Math.max(0, store.plateHeight - store.qrSize - 10)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>상단 아치 곡률 (mm): {store.topArchRadius.toFixed(1)}</label>
          <input
            type="range"
            value={store.topArchRadius}
            onChange={(e) => store.setTopArchRadius(Number(e.target.value))}
            min="0.0"
            max={Math.min(50, store.plateWidth / 2 - 1)}
            step="0.2"
            style={{ ...inputStyle, height: '30px' }}
          />
        </div>
      </div>

      {/* 색상 설정 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>색상 설정</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>판 색상</label>
          <input
            type="color"
            value={store.plateColor}
            onChange={(e) => store.setPlateColor(e.target.value)}
            style={{ ...inputStyle, height: '40px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>QR 코드 색상</label>
          <input
            type="color"
            value={store.qrColor}
            onChange={(e) => store.setQrColor(e.target.value)}
            style={{ ...inputStyle, height: '40px' }}
          />
        </div>
      </div>

      {/* OBJ Export */}
      <div style={{ marginBottom: '25px' }}>
        <button
          onClick={() => {
            if (!isSignedIn) {
              alert('주문하려면 먼저 로그인해주세요.');
              return;
            }
            onExportOBJ();
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

    </div>
  );
}
