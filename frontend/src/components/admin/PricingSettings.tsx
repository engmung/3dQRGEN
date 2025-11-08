/**
 * PricingSettingsPanel Component
 * Manages pricing configuration and announcement messages
 */

import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../common/Button';
import { FormField } from '../common/FormField';
import { FormTextarea } from '../common/FormTextarea';
import { formatPrice } from '../../utils/formatters';
import { invalidatePricingCache } from '../../utils/pricing';
import { updatePricingSettings, type PricingSettings } from '../../utils/api';

interface PricingSettingsPanelProps {
  pricingSettings: PricingSettings | null;
  onUpdate: (settings: PricingSettings) => void;
}

export const PricingSettingsPanel: React.FC<PricingSettingsPanelProps> = ({
  pricingSettings,
  onUpdate,
}) => {
  const { getToken } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<PricingSettings>({
    base_price: pricingSettings?.base_price || 20000,
    text_price: pricingSettings?.text_price || 5000,
    image_price: pricingSettings?.image_price || 5000,
    announcement_message: pricingSettings?.announcement_message || '',
  });

  // Update form data when pricing settings change
  useState(() => {
    if (pricingSettings) {
      setFormData(pricingSettings);
    }
  });

  const handleSave = async () => {
    try {
      const token = await getToken();
      const updated = await updatePricingSettings(formData, token);
      onUpdate(updated);
      invalidatePricingCache();
      setEditing(false);
      alert('가격 설정이 저장되었습니다.');
    } catch (err: any) {
      alert('가격 설정 저장 실패: ' + err.message);
    }
  };

  const handleCancel = () => {
    setFormData(pricingSettings || {
      base_price: 20000,
      text_price: 5000,
      image_price: 5000,
      announcement_message: '',
    });
    setEditing(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>가격 설정</h2>
        {!editing && (
          <Button onClick={() => setEditing(true)} variant="secondary" size="sm">
            수정
          </Button>
        )}
      </div>

      {editing ? (
        <div>
          <div style={styles.grid}>
            <FormField
              label="기본 가격 (원)"
              type="number"
              value={formData.base_price}
              onChange={(val) => setFormData({ ...formData, base_price: Number(val) })}
            />
            <FormField
              label="텍스트 추가 (원)"
              type="number"
              value={formData.text_price}
              onChange={(val) => setFormData({ ...formData, text_price: Number(val) })}
            />
            <FormField
              label="이미지 추가 (원/개)"
              type="number"
              value={formData.image_price}
              onChange={(val) => setFormData({ ...formData, image_price: Number(val) })}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <FormTextarea
              label="공지사항 (홈 화면 배너에 표시됩니다)"
              value={formData.announcement_message || ''}
              onChange={(val) => setFormData({ ...formData, announcement_message: val })}
              placeholder="예: 현재 테스트기간이라 3일간만 15개 판매중입니다.&#10;이후 오픈은 2025년 2월 1일 예정입니다."
              rows={4}
              helperText="비워두면 기본 메시지가 표시됩니다."
            />
          </div>

          <div style={styles.actions}>
            <Button onClick={handleCancel} variant="ghost">
              취소
            </Button>
            <Button onClick={handleSave} variant="primary">
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div style={styles.displayGrid}>
          <div>
            <div style={styles.labelText}>기본 가격</div>
            <div style={styles.priceText}>
              {pricingSettings ? formatPrice(pricingSettings.base_price) : '로딩 중...'}
            </div>
          </div>
          <div>
            <div style={styles.labelText}>텍스트 추가</div>
            <div style={styles.priceText}>
              {pricingSettings ? formatPrice(pricingSettings.text_price) : '로딩 중...'}
            </div>
          </div>
          <div>
            <div style={styles.labelText}>이미지 추가 (개당)</div>
            <div style={styles.priceText}>
              {pricingSettings ? formatPrice(pricingSettings.image_price) : '로딩 중...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '2px solid #4CAF50',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    marginBottom: '15px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  displayGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
  },
  labelText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  priceText: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#333',
  },
};
