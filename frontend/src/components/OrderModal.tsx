import { useState, useEffect } from 'react';
import { AddressForm, type AddressFormData } from './AddressForm';
import type { CartItem } from '../store/useCartStore';
import { getPricingSettings, calculatePlatePrice, formatPrice } from '../utils/pricing';
import { getQRTypeLabel } from '../utils/qrHelpers';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';
import { COLORS } from '../styles/colors';
import { useIsMobile } from '../hooks/useMediaQuery';

interface PricingSettings {
  base_price: number;
  text_price: number;
  image_price: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customerEmail: string;
  onSubmit: (addressData: AddressFormData) => Promise<void>;
}

export const OrderModal = ({
  isOpen,
  onClose,
  cartItems,
  customerEmail,
  onSubmit,
}: OrderModalProps) => {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);

  // 가격 설정 로드
  useEffect(() => {
    if (isOpen) {
      getPricingSettings().then(setPricingSettings);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 가격 계산 (수량 포함)
  const totalPrice = pricingSettings
    ? cartItems.reduce((sum, item) => sum + calculatePlatePrice(item.plateConfig, pricingSettings) * item.quantity, 0)
    : 0;

  // 총 제품 개수 계산 (quantity 합계)
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 주문 제출
  const handleSubmit = async (addressData: AddressFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(addressData);
      // 성공 시 모달은 부모 컴포넌트에서 닫음
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('주문에 실패했습니다: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div
        style={{
          ...MODAL_CONTENT_LARGE,
          backgroundColor: COLORS.background.white,
          color: COLORS.text.primary,
          borderRadius: '12px',
          maxHeight: '95vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '95vw' : '90vw',
          maxWidth: isMobile ? '95vw' : '1200px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 배송지 입력 폼 (AddressForm 재사용) */}
        <div style={{ backgroundColor: 'white' }}>
          <AddressForm
            initialData={{ customerEmail }}
            price={totalPrice}
            totalQuantity={totalQuantity}
            cartItems={cartItems}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>

        {/* 로딩 오버레이 */}
        {isSubmitting && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '12px',
            }}
          >
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>
                주문 처리 중...
              </div>
              <div style={{ fontSize: '14px', fontWeight: 400, color: '#aaa' }}>
                OBJ 파일 생성 및 전송 중입니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
