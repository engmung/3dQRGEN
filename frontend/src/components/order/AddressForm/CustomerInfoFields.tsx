/**
 * CustomerInfoFields Component
 * Customer name, email, and phone input fields
 */

import React from 'react';
import { FormField } from '../../common/FormField';
import { formatPhone } from '../../../utils/formatters';

interface CustomerInfoFieldsProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  customerName,
  customerEmail,
  customerPhone,
  onCustomerNameChange,
  onCustomerPhoneChange,
}) => {
  // Auto-format phone number with hyphens
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    let formatted = digitsOnly;

    if (digitsOnly.length <= 3) {
      formatted = digitsOnly;
    } else if (digitsOnly.length <= 7) {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length <= 11) {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
    } else {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7, 11)}`;
    }

    onCustomerPhoneChange(formatted);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <FormField
        label="이름"
        value={customerName}
        onChange={onCustomerNameChange}
        type="text"
        required
      />

      <div style={{ marginTop: '15px' }}>
        <FormField
          label="이메일"
          value={customerEmail}
          onChange={() => {}} // Read-only
          type="email"
          disabled
          required
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <FormField
          label="전화번호"
          value={customerPhone}
          onChange={handlePhoneChange}
          type="tel"
          placeholder="010-1234-5678"
          helperText="예: 010-1234-5678"
          required
        />
      </div>
    </div>
  );
};
