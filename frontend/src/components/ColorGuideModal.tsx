import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ColorInfo {
  name: string;
  value: string;
}

interface ColorCombination {
  colors: string[];
}

interface ColorGuideModalProps {
  availableColors: ColorInfo[];
  allowedCombinations: ColorCombination[];
  colorWarningMessage: string;
  onClose: () => void;
  currentPlateColor?: string;
  currentQrColor?: string;
}

export function ColorGuideModal({
  onClose,
}: ColorGuideModalProps) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        ...MODAL_OVERLAY,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...(isMobile ? {
            width: '90%',
            maxWidth: '350px',
            maxHeight: '85vh',
            margin: 0,
            borderRadius: '12px',
            overflow: 'auto',
            backgroundColor: 'white',
            padding: '20px',
          } : {
            ...MODAL_CONTENT_LARGE,
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto',
          }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #333',
            paddingBottom: '15px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '24px' }}>Color Guide</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
          >
            ×
          </button>
        </div>

        {/* 색상 대비 안내 */}
        <section style={{ marginBottom: '30px' }}>
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
            }}
          >
            <h3 style={{
              fontSize: '18px',
              marginBottom: '12px',
              color: '#333',
              fontWeight: 700,
            }}>
              ⚠️ Important: Color Contrast
            </h3>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#555',
              lineHeight: '1.7',
            }}>
              Please ensure sufficient contrast between plate and QR colors.<br />
              <strong>Similar colors may result in QR code scanning failure.</strong><br />
              <br />
              Examples of good contrast:<br />
              • Black + White<br />
              • Dark colors + Light colors<br />
              • High saturation + Low saturation
            </p>
          </div>
        </section>

        {/* 닫기 버튼 */}
        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#555')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#333')
            }
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
