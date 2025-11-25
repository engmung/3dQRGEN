import type { WiFiData } from '../../utils/qrGenerator';

interface WiFiFormProps {
  data: WiFiData;
  onChange: (data: WiFiData) => void;
}

/**
 * WiFi QR Code Input Form
 * Input for SSID, password, and security type
 */
export function WiFiForm({ data, onChange }: WiFiFormProps) {
  const handleChange = (field: keyof WiFiData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* SSID input */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          Network Name (SSID) *
        </label>
        <input
          type="text"
          value={data.ssid}
          onChange={(e) => handleChange('ssid', e.target.value)}
          placeholder="e.g., MyWiFi"
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

      {/* Security type selection */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          Security Type *
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
          <option value="nopass">No Password</option>
        </select>
      </div>

      {/* Password input (only shown when security is not 'nopass') */}
      {data.security !== 'nopass' && (
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
            Password *
          </label>
          <input
            type="text"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Enter WiFi password"
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

      {/* Info message */}
      <div
        style={{
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        Scan this QR code with your smartphone to automatically connect to WiFi.
      </div>
    </div>
  );
}
