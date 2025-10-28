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
  availableColors,
  allowedCombinations,
  colorWarningMessage,
  onClose,
  currentPlateColor,
  currentQrColor,
}: ColorGuideModalProps) {
  const isMobile = useIsMobile();

  // 현재 선택된 색상 조합이 허용되는지 확인
  const isCurrentCombinationValid = () => {
    if (!currentPlateColor || !currentQrColor) return true;
    if (currentPlateColor === currentQrColor) return false;

    return allowedCombinations.some(combo =>
      combo.colors.length === 2 &&
      combo.colors.includes(currentPlateColor) &&
      combo.colors.includes(currentQrColor)
    );
  };

  const getCurrentColorName = (colorValue: string) => {
    const color = availableColors.find(c => c.value === colorValue);
    return color?.name || colorValue;
  };
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
          <h2 style={{ margin: 0, fontSize: '24px' }}>출력 가능한 색상 안내</h2>
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

        {/* 현재 선택된 색상 조합 경고 */}
        {currentPlateColor && currentQrColor && !isCurrentCombinationValid() && (
          <section style={{ marginBottom: '25px' }}>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#ffebee',
                border: '2px solid #f44336',
                borderRadius: '8px',
              }}
            >
              <h3 style={{
                fontSize: '16px',
                marginBottom: '12px',
                color: '#c62828',
                fontWeight: 700,
              }}>
                ⚠️ 현재 선택된 색상 조합은 출력이 불가능합니다
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: currentPlateColor,
                      border: '2px solid #333',
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>
                    {getCurrentColorName(currentPlateColor)}
                  </span>
                </div>

                <span style={{ fontSize: '18px', color: '#999' }}>+</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: currentQrColor,
                      border: '2px solid #333',
                    }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>
                    {getCurrentColorName(currentQrColor)}
                  </span>
                </div>
              </div>

              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#555',
                lineHeight: '1.5',
              }}>
                {currentPlateColor === currentQrColor
                  ? '같은 색상끼리는 조합할 수 없습니다.'
                  : '이 색상 조합은 QR 코드 인식이 불가능합니다.'
                }
                <br />
                아래의 허용된 색상 조합을 참고해주세요.
              </p>
            </div>
          </section>
        )}

        {/* 사용 가능한 색상 */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>
            ✅ 사용 가능한 색상 (출력 가능)
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {availableColors.map((color) => (
              <div
                key={color.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color.value,
                    border: '2px solid #ccc',
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {color.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 허용된 조합 */}
        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>
            ⭐ 허용된 색상 조합 (QR 인식 가능)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allowedCombinations.map((combo, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  backgroundColor: '#f0f8f0',
                }}
              >
                {/* 색상 1 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    색상 1
                  </div>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      backgroundColor: combo.colors[0],
                      border: '2px solid #333',
                    }}
                  />
                </div>

                <div style={{ fontSize: '20px', color: '#999' }}>+</div>

                {/* 색상 2 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    색상 2
                  </div>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      backgroundColor: combo.colors[1],
                      border: '2px solid #333',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 안내 메시지 */}
        {colorWarningMessage && (
          <section style={{ marginBottom: '30px' }}>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}
            >
              {colorWarningMessage}
            </div>
          </section>
        )}

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
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
