/**
 * AddressFields Component
 * Postal code, address, detail address, and delivery message fields
 */

import React from 'react';
import { FormField } from '../../common/FormField';
import { FormTextarea } from '../../common/FormTextarea';
import { Button } from '../../common/Button';

interface AddressFieldsProps {
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMessage: string;
  onDetailAddressChange: (value: string) => void;
  onDeliveryMessageChange: (value: string) => void;
  onSearchPostcode: () => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  postalCode,
  address,
  detailAddress,
  deliveryMessage,
  onDetailAddressChange,
  onDeliveryMessageChange,
  onSearchPostcode,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Postal Code */}
      <div>
        <label style={styles.label}>
          우편번호
          <span style={styles.required}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={postalCode}
            readOnly
            placeholder="우편번호"
            style={{
              ...styles.input,
              ...styles.inputDisabled,
              flex: 1,
            }}
          />
          <Button onClick={onSearchPostcode} variant="secondary" size="md">
            우편번호 검색
          </Button>
        </div>
      </div>

      {/* Address */}
      <div style={{ marginTop: '15px' }}>
        <FormField
          label="주소"
          value={address}
          onChange={() => {}} // Read-only
          type="text"
          placeholder="우편번호 검색 후 자동 입력됩니다"
          disabled
          required
        />
      </div>

      {/* Detail Address */}
      <div style={{ marginTop: '15px' }}>
        <FormField
          label="상세주소"
          value={detailAddress}
          onChange={onDetailAddressChange}
          type="text"
          placeholder="상세주소를 입력해주세요"
          required
        />
      </div>

      {/* Delivery Message */}
      <div style={{ marginTop: '15px' }}>
        <FormTextarea
          label="배송 메시지"
          value={deliveryMessage}
          onChange={onDeliveryMessageChange}
          placeholder="공동현관 비밀번호, 부재 시 조치 사항 등을 입력해주세요"
          rows={3}
          helperText="선택사항입니다"
        />
      </div>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
  } as React.CSSProperties,

  required: {
    color: '#F44336',
    marginLeft: '4px',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #E5E0DB',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    color: '#333',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
    cursor: 'not-allowed',
  } as React.CSSProperties,
};
