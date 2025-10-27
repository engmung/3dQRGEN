import { useState, useEffect } from 'react';
import { AddressForm, type AddressFormData } from './AddressForm';
import type { CartItem } from '../store/useCartStore';
import { getPricingSettings, calculatePlatePrice, formatPrice } from '../utils/pricing';
import { getQRTypeLabel } from '../utils/qrHelpers';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';
import { COLORS } from '../styles/colors';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);

  // 가격 설정 로드
  useEffect(() => {
    if (isOpen) {
      getPricingSettings().then(setPricingSettings);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 가격 계산
  const totalPrice = pricingSettings
    ? cartItems.reduce((sum, item) => sum + calculatePlatePrice(item.plateConfig, pricingSettings), 0)
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 주문 요약 섹션 */}
        <div
          style={{
            padding: '20px',
            borderBottom: '2px solid #e0e0e0',
            backgroundColor: '#f8f8f8',
          }}
        >
          <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 700, color: '#333' }}>
            📦 주문 내역 ({cartItems.length}종, 총 {totalQuantity}개)
          </h2>

          {/* 장바구니 아이템 목록 */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  marginBottom: '10px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#888', fontSize: '13px' }}>#{index + 1}</span>
                  <span style={{ fontWeight: 600, color: '#333' }}>
                    {getQRTypeLabel(item.plateConfig.qrType)} QR
                  </span>
                  <span style={{ fontSize: '13px', color: '#2196F3', fontWeight: 600, marginLeft: '4px' }}>
                    × {item.quantity}개
                  </span>
                  <div style={{ flex: 1 }} />
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: item.plateConfig.plateColor,
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                    }}
                    title={`거치대: ${item.plateConfig.plateColor}`}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: item.plateConfig.qrColor,
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                    }}
                    title={`QR: ${item.plateConfig.qrColor}`}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
                  {item.plateConfig.qrType === 'url' && item.plateConfig.qrUrl && (
                    <div>URL: {item.plateConfig.qrUrl.substring(0, 50)}{item.plateConfig.qrUrl.length > 50 ? '...' : ''}</div>
                  )}
                  {item.plateConfig.qrType === 'wifi' && (
                    <div>WiFi: {item.plateConfig.qrWifiData.ssid || '(설정 없음)'}</div>
                  )}
                  {item.plateConfig.qrType === 'email' && (
                    <div>Email: {item.plateConfig.qrEmailData.recipient || '(설정 없음)'}</div>
                  )}
                </div>

                {/* 판 가격 상세 */}
                {pricingSettings && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>기본 가격</span>
                      <span>{formatPrice(pricingSettings.base_price)}</span>
                    </div>
                    {item.plateConfig.text && item.plateConfig.text.trim().length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>+ 텍스트 추가</span>
                        <span>{formatPrice(pricingSettings.text_price)}</span>
                      </div>
                    )}
                    {item.plateConfig.images.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>+ 이미지 {item.plateConfig.images.length}개</span>
                        <span>{formatPrice(pricingSettings.image_price * item.plateConfig.images.length)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0e0e0', fontWeight: 600, color: '#333', fontSize: '13px' }}>
                      <span>판 합계</span>
                      <span>{formatPrice(calculatePlatePrice(item.plateConfig, pricingSettings))}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 총 금액 */}
          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#e3f5ff',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '2px solid #2196F3',
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>💰 총 결제 금액</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#2196F3' }}>
              {pricingSettings ? formatPrice(totalPrice) : '계산 중...'}
            </span>
          </div>
        </div>

        {/* 배송지 입력 폼 (AddressForm 재사용) */}
        <div style={{ backgroundColor: 'white' }}>
          <AddressForm
            initialData={{ customerEmail }}
            price={totalPrice}
            totalQuantity={totalQuantity}
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
