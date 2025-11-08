/**
 * AddressForm Component (Main)
 * Shipping information form with address search and payment details
 */

import React, { useState, useEffect } from 'react';
import { CustomerInfoFields } from './CustomerInfoFields';
import { AddressFields } from './AddressFields';
import { OrderSummary } from './OrderSummary';
import { BankAccountInfo } from './BankAccountInfo';
import { AddressSearchModal } from '../AddressSearchModal';
import { CustomerCalendar } from '../../CustomerCalendar';
import { Button } from '../../common/Button';
import { getPricingSettings } from '../../../utils/pricing';
import { validateEmail, validatePhone } from '../../../utils/validation';
import type { QRPlateConfig } from '../../../store/useDesignStore';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { COLORS } from '../../../constants/colors';

export interface AddressFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMessage: string;
}

interface CartItem {
  id: string;
  plateConfig: QRPlateConfig;
  quantity: number;
}

interface AddressFormProps {
  initialData: Partial<AddressFormData>;
  price: number;
  productTotal: number;
  shippingFee: number;
  totalQuantity: number;
  cartItems: CartItem[];
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'addressFormData';

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  price,
  productTotal,
  shippingFee,
  totalQuantity,
  cartItems,
  onSubmit,
  onCancel,
}) => {
  const isMobile = useIsMobile();
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [showPostcode, setShowPostcode] = useState(false);

  // Load saved data from localStorage
  const loadSavedData = (): Partial<AddressFormData> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const savedData = loadSavedData();

  const [formData, setFormData] = useState<AddressFormData>({
    customerName: savedData.customerName || initialData.customerName || '',
    customerEmail: initialData.customerEmail || '', // Always use current login info
    customerPhone: savedData.customerPhone || initialData.customerPhone || '',
    postalCode: savedData.postalCode || initialData.postalCode || '',
    address: savedData.address || initialData.address || '',
    detailAddress: savedData.detailAddress || initialData.detailAddress || '',
    deliveryMessage: savedData.deliveryMessage || initialData.deliveryMessage || '',
  });

  // Fetch pricing settings
  useEffect(() => {
    getPricingSettings().then(setPricingSettings);
  }, []);

  // Auto-save form data to localStorage (except email)
  useEffect(() => {
    const dataToSave = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      postalCode: formData.postalCode,
      address: formData.address,
      detailAddress: formData.detailAddress,
      deliveryMessage: formData.deliveryMessage,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData]);

  // Handle postcode search completion
  const handlePostcodeComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setFormData({
      ...formData,
      postalCode: data.zonecode,
      address: fullAddress,
    });
    setShowPostcode(false);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      alert('이름을 입력해주세요.');
      return false;
    }
    if (!formData.customerEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return false;
    }
    if (!validateEmail(formData.customerEmail)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      alert('전화번호를 입력해주세요.');
      return false;
    }
    if (!validatePhone(formData.customerPhone)) {
      alert('올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)');
      return false;
    }
    if (!formData.postalCode.trim()) {
      alert('우편번호를 검색해주세요.');
      return false;
    }
    if (!formData.detailAddress.trim()) {
      alert('상세주소를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div style={{ ...styles.container, padding: isMobile ? '8px' : '30px' }}>
      <h2 style={{ ...styles.title, ...(isMobile && styles.titleMobile) }}>
        배송 정보 입력
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <CustomerInfoFields
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          customerPhone={formData.customerPhone}
          onCustomerNameChange={(value) => setFormData({ ...formData, customerName: value })}
          onCustomerPhoneChange={(value) => setFormData({ ...formData, customerPhone: value })}
        />

        {/* Address Fields */}
        <AddressFields
          postalCode={formData.postalCode}
          address={formData.address}
          detailAddress={formData.detailAddress}
          deliveryMessage={formData.deliveryMessage}
          onDetailAddressChange={(value) => setFormData({ ...formData, detailAddress: value })}
          onDeliveryMessageChange={(value) => setFormData({ ...formData, deliveryMessage: value })}
          onSearchPostcode={() => setShowPostcode(true)}
        />

        {/* Production Calendar */}
        <div style={{ marginBottom: isMobile ? '10px' : '20px' }}>
          <CustomerCalendar totalQuantity={totalQuantity} readOnly={true} />
        </div>

        {/* Price Summary */}
        <div style={{ marginBottom: isMobile ? '10px' : '20px' }}>
          <OrderSummary
            cartItems={cartItems}
            pricingSettings={pricingSettings}
            productTotal={productTotal}
            shippingFee={shippingFee}
            totalPrice={price}
          />

          {/* Bank Account Info */}
          <BankAccountInfo totalPrice={price} />
        </div>

        {/* Action Buttons */}
        <div style={{ ...styles.buttonGroup, ...(isMobile && styles.buttonGroupMobile) }}>
          <Button onClick={onCancel} variant="ghost" size={isMobile ? 'md' : 'lg'} type="button">
            취소
          </Button>
          <Button type="submit" variant="primary" size={isMobile ? 'md' : 'lg'}>
            주문하기
          </Button>
        </div>
      </form>

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={showPostcode}
        onClose={() => setShowPostcode(false)}
        onComplete={handlePostcodeComplete}
      />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
  } as React.CSSProperties,

  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: COLORS.UI.TEXT_PRIMARY,
    fontSize: '20px',
    fontWeight: 700,
  } as React.CSSProperties,

  titleMobile: {
    fontSize: '16px',
    marginBottom: '10px',
  } as React.CSSProperties,

  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  } as React.CSSProperties,

  buttonGroupMobile: {
    flexDirection: 'column' as const,
  } as React.CSSProperties,
};
