import { useState, useEffect } from 'react';
import { AddressForm, type AddressFormData } from './AddressForm';
import type { CartItem } from '../store/useCartStore';
import { getPricingSettings, calculatePlatePrice, formatPrice, type PricingSettings } from '../utils/pricing';

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

  // QR 타입 라벨
  const getQRTypeLabel = (qrType: string) => {
    switch (qrType) {
      case 'url':
        return 'URL';
      case 'wifi':
        return 'WiFi';
      case 'email':
        return 'Email';
      default:
        return qrType;
    }
  };

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '95%',
          maxHeight: '95vh',
          overflow: 'auto',
          color: '#fff',
        }}
      >
        {/* 주문 요약 섹션 */}
        <div
          style={{
            padding: '20px',
            borderBottom: '2px solid #444',
            backgroundColor: '#1a1a1a',
          }}
        >
          <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 700 }}>
            주문 내역 ({cartItems.length}개)
          </h2>

          {/* 장바구니 아이템 목록 */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#333',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#aaa' }}>#{index + 1}</span>
                  <span style={{ fontWeight: 600 }}>
                    {getQRTypeLabel(item.plateConfig.qrType)} QR
                  </span>
                  <div style={{ flex: 1 }} />
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: item.plateConfig.plateColor,
                      border: '1px solid #666',
                      borderRadius: '3px',
                    }}
                    title={`거치대: ${item.plateConfig.plateColor}`}
                  />
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: item.plateConfig.qrColor,
                      border: '1px solid #666',
                      borderRadius: '3px',
                    }}
                    title={`QR: ${item.plateConfig.qrColor}`}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', wordBreak: 'break-all' }}>
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
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #555' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #666', fontWeight: 600, color: '#fff' }}>
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
              padding: '12px',
              backgroundColor: '#444',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700 }}>총 주문 금액</span>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#4CAF50' }}>
              {pricingSettings ? formatPrice(totalPrice) : '계산 중...'}
            </span>
          </div>
        </div>

        {/* 배송지 입력 폼 (AddressForm 재사용) */}
        <div style={{ backgroundColor: 'white' }}>
          <AddressForm
            initialData={{ customerEmail }}
            price={totalPrice}
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
