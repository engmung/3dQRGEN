import type { QRType } from '../store/useDesignStore';

interface QRTypeSelectorProps {
  value: QRType;
  onChange: (type: QRType) => void;
}

/**
 * QR 타입 선택 컴포넌트
 * URL, WiFi, Email 중 하나를 선택할 수 있는 라디오 버튼 그룹
 */
export function QRTypeSelector({ value, onChange }: QRTypeSelectorProps) {
  const options: { value: QRType; label: string; icon: string }[] = [
    { value: 'url', label: 'URL', icon: '🔗' },
    { value: 'wifi', label: 'WiFi', icon: '📶' },
    { value: 'email', label: 'Email', icon: '📧' },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
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
              padding: '10px 12px',
              border: value === option.value ? '2px solid #4CAF50' : '2px solid #ddd',
              borderRadius: '6px',
              backgroundColor: value === option.value ? '#e8f5e9' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '13px',
              fontWeight: value === option.value ? 'bold' : 'normal',
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
            <span style={{ fontSize: '18px' }}>{option.icon}</span>
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
