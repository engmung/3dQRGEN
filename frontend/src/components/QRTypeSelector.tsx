import type { QRType } from '../store/useDesignStore';
import { useIsMobile } from '../hooks/useMediaQuery';

interface QRTypeSelectorProps {
  value: QRType;
  onChange: (type: QRType) => void;
}

/**
 * QR 타입 선택 컴포넌트
 * URL, WiFi, Email 중 하나를 선택할 수 있는 라디오 버튼 그룹
 */
export function QRTypeSelector({ value, onChange }: QRTypeSelectorProps) {
  const isMobile = useIsMobile();

  const options: { value: QRType; label: string }[] = [
    { value: 'url', label: 'URL' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'email', label: 'Email' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: 600,
        fontSize: '16px',
        color: '#333',
        ...(isMobile && {
          textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)'
        })
      }}>
        QR 타입
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isMobile ? '8px 10px' : '10px 12px',
              border: value === option.value ? '2px solid #333' : '2px solid #ddd',
              borderRadius: '6px',
              backgroundColor: value === option.value ? '#f5f5f5' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: value === option.value ? 600 : 400,
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.borderColor = '#999';
              }
            }}
            onMouseLeave={(e) => {
              if (value !== option.value) {
                e.currentTarget.style.borderColor = '#ddd';
              }
            }}
          >
            <input
              type="radio"
              name="qrType"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              style={{ display: 'none' }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
