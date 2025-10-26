import type { EmailData } from '../../utils/qrGenerator';

interface EmailFormProps {
  data: EmailData;
  onChange: (data: EmailData) => void;
}

/**
 * Email QR 코드 입력 폼
 * 수신자, 제목, 본문을 입력받음
 */
export function EmailForm({ data, onChange }: EmailFormProps) {
  const handleChange = (field: keyof EmailData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 수신자 입력 */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          수신자 (To) *
        </label>
        <input
          type="email"
          value={data.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          placeholder="예: contact@example.com"
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '13px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4CAF50')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
          여러 수신자는 쉼표로 구분 (예: a@example.com, b@example.com)
        </div>
      </div>

      {/* 제목 입력 */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          제목 (Subject)
        </label>
        <input
          type="text"
          value={data.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="예: 문의사항"
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '13px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4CAF50')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
      </div>

      {/* 본문 입력 */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>
          본문 (Body)
        </label>
        <textarea
          value={data.body}
          onChange={(e) => handleChange('body', e.target.value)}
          placeholder="이메일 본문 내용을 입력하세요"
          rows={4}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '13px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#4CAF50')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
      </div>

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
        💡 스마트폰에서 QR 코드를 스캔하면 이메일 앱이 열리며 작성된 내용이 자동으로 입력됩니다.
      </div>
    </div>
  );
}
