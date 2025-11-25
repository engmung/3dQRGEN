import type { EmailData } from '../../utils/qrGenerator';

interface EmailFormProps {
  data: EmailData;
  onChange: (data: EmailData) => void;
}

/**
 * Email QR Code Input Form
 * Input for recipient, subject, and body
 */
export function EmailForm({ data, onChange }: EmailFormProps) {
  const handleChange = (field: keyof EmailData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
      {/* Recipient input */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          Recipient (To) *
        </label>
        <input
          type="email"
          value={data.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          placeholder="e.g., contact@example.com"
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
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
          Multiple recipients can be separated by comma (e.g., a@example.com, b@example.com)
        </div>
      </div>

      {/* Subject input */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          Subject
        </label>
        <input
          type="text"
          value={data.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="e.g., Inquiry"
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

      {/* Body input */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '16px', fontWeight: 600 }}>
          Body
        </label>
        <textarea
          value={data.body}
          onChange={(e) => handleChange('body', e.target.value)}
          placeholder="Enter email body content"
          rows={4}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#333')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
      </div>

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
        Scan this QR code with your smartphone to open the email app with pre-filled content.
      </div>
    </div>
  );
}
