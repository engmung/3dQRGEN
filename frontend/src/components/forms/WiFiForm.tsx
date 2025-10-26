import type { WiFiData } from '../../utils/qrGenerator';

interface WiFiFormProps {
  data: WiFiData;
  onChange: (data: WiFiData) => void;
}

/**
 * WiFi QR 코드 입력 폼
 * SSID, 비밀번호, 보안 타입을 입력받음
 */
export function WiFiForm({ data, onChange }: WiFiFormProps) {
  const handleChange = (field: keyof WiFiData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* SSID 입력 */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          네트워크 이름 (SSID) *
        </label>
        <input
          type="text"
          value={data.ssid}
          onChange={(e) => handleChange('ssid', e.target.value)}
          placeholder="예: MyWiFi"
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#333')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
      </div>

      {/* 보안 타입 선택 */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          보안 타입 *
        </label>
        <select
          value={data.security}
          onChange={(e) => handleChange('security', e.target.value as WiFiData['security'])}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#333')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        >
          <option value="WPA">WPA / WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">비밀번호 없음</option>
        </select>
      </div>

      {/* 비밀번호 입력 (보안 타입이 'nopass'가 아닐 때만 표시) */}
      {data.security !== 'nopass' && (
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
            비밀번호 *
          </label>
          <input
            type="text"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="WiFi 비밀번호 입력"
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
          />
        </div>
      )}

      {/* 안내 메시지 */}
      <div
        style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        💡 스마트폰에서 QR 코드를 스캔하면 자동으로 WiFi에 연결됩니다.
      </div>
    </div>
  );
}
