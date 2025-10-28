import { useDesignStore, type QRPlateConfig } from '../store/useDesignStore';
import { generateQRString } from '../utils/qrGenerator';
import { generateQRBitmap } from '../utils/qrUtils';
import { getPricingSettings, calculatePlatePrice, formatPrice } from '../utils/pricing';
import type { PricingSettings } from '../utils/api';
import { useEffect, useState } from 'react';
import { AvailabilityBanner } from './AvailabilityBanner';
import { useIsMobile } from '../hooks/useMediaQuery';

interface RightPanelProps {
  onCheckout: () => void;
}

// QR 미리보기 컴포넌트 (Hook 사용을 위해 분리)
function QRPreview({ plate }: { plate: QRPlateConfig }) {
  const [qrBitmap, setQrBitmap] = useState<{ data: boolean[][]; size: number } | null>(null);

  useEffect(() => {
    // QR 문자열 생성
    let qrString = '';
    try {
      if (plate.qrType === 'url') {
        qrString = generateQRString('url', plate.qrUrl);
      } else if (plate.qrType === 'wifi') {
        qrString = generateQRString('wifi', plate.qrWifiData);
      } else if (plate.qrType === 'email') {
        qrString = generateQRString('email', plate.qrEmailData);
      }
    } catch (error) {
      console.error('QR string generation error:', error);
      return;
    }

    if (!qrString || qrString.trim() === '') {
      setQrBitmap(null);
      return;
    }

    // QR 비트맵 생성
    generateQRBitmap(qrString)
      .then((bitmap) => setQrBitmap(bitmap))
      .catch((err) => {
        console.error('QR bitmap generation error:', err);
        setQrBitmap(null);
      });
  }, [plate.qrType, plate.qrUrl, plate.qrWifiData, plate.qrEmailData]);

  return (
    <div style={{
      width: '50%',
      height: '100%',
      backgroundColor: plate.plateColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
    }}>
      {qrBitmap && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${qrBitmap.size}, 1fr)`,
          gap: '0px',
          width: '100%',
          height: '100%',
        }}>
          {qrBitmap.data.flat().map((filled, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: filled ? plate.qrColor : plate.plateColor,
                width: '100%',
                height: '100%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RightPanel({ onCheckout }: RightPanelProps) {
  const isMobile = useIsMobile();
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);
  const addPlate = useDesignStore((state) => state.addPlate);
  const removePlate = useDesignStore((state) => state.removePlate);
  const duplicatePlate = useDesignStore((state) => state.duplicatePlate);
  const updatePlateQuantity = useDesignStore((state) => state.updatePlateQuantity);

  // 가격 설정 상태
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);

  // 주문 가능 정보 모달 상태
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // 가격 설정 로드
  useEffect(() => {
    getPricingSettings().then(setPricingSettings);
  }, []);

  // 전체 수량 계산
  const totalQuantity = plates.reduce((sum, plate) => sum + plate.quantity, 0);

  // 전체 가격 계산 (제품 합계 + 배송비)
  const SHIPPING_FEE = 5000;
  const productTotal = pricingSettings
    ? plates.reduce((sum, plate) => {
        const platePrice = calculatePlatePrice(plate, pricingSettings);
        return sum + (platePrice * plate.quantity);
      }, 0)
    : 0;
  // 제품이 있을 때만 배송비 추가
  const totalPrice = plates.length > 0 ? productTotal + SHIPPING_FEE : 0;

  const cardStyle = (isSelected: boolean) => ({
    width: '100%',
    aspectRatio: '2 / 1',
    backgroundColor: isSelected ? '#fff' : '#f5f5f5',
    border: isSelected ? '3px solid #333' : '2px solid #e5e0db',
    borderRadius: '0',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s',
    boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    position: 'relative' as const,
  });

  const addButtonStyle = {
    width: '100%',
    aspectRatio: '2 / 1',
    backgroundColor: '#fafafa',
    border: '2px dashed #ccc',
    borderRadius: '0',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    color: '#999',
    transition: 'all 0.2s',
  };

  // 우측 컨트롤 영역 (50%)
  const renderControls = (plate: typeof plates[0]) => {
    return (
      <div style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 상단: 수량 조절 */}
        <div style={{
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '4px',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 600, marginRight: '2px' }}>수량:</span>
          <span style={{ fontSize: '24px', fontWeight: 700, marginRight: '4px' }}>
            {plate.quantity}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (plate.quantity === 1) {
                removePlate(plate.id);
              } else {
                updatePlateQuantity(plate.id, plate.quantity - 1);
              }
            }}
            style={{
              width: '26px',
              height: '26px',
              border: '1px solid #ccc',
              borderRadius: '0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            }}
          >
            −
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updatePlateQuantity(plate.id, plate.quantity + 1);
            }}
            style={{
              width: '26px',
              height: '26px',
              border: '1px solid #ccc',
              borderRadius: '0',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
            }}
          >
            +
          </button>
        </div>

        {/* 하단: 복사/삭제 버튼 */}
        <div style={{
          height: '50%',
          display: 'flex',
          gap: '0',
        }}>
          {/* 좌측: 복사 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const duplicated = duplicatePlate(plate.id);
              if (duplicated) selectPlate(duplicated.id);
            }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '0',
              backgroundColor: '#999',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#777'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#999'}
          >
            복사
          </button>

          {/* 우측: 삭제 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePlate(plate.id);
            }}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: '0',
              backgroundColor: '#FF6B6B',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FF5252'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B6B'}
          >
            삭제
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: isMobile ? '100%' : '17%',
      height: isMobile ? 'auto' : 'calc(100vh - 50px)',
      backgroundColor: isMobile ? 'transparent' : '#fff',
      borderLeft: isMobile ? 'none' : '1px solid #e5e0db',
      display: 'flex',
      flexDirection: 'column',
      overflow: isMobile ? 'visible' : 'hidden'
    }}>
      {/* 상단: 타이틀 */}
      {!isMobile && (
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #e5e0db',
          fontWeight: 600,
          fontSize: '18px',
          backgroundColor: '#f5f3f0'
        }}>
          장바구니
        </div>
      )}

      {/* 중앙: 카드 리스트 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isMobile ? '12px 20px' : '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {plates.map((plate) => (
          <div key={plate.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* 카드 */}
            <div
              style={cardStyle(plate.id === selectedPlateId)}
              onClick={() => selectPlate(plate.id)}
              onMouseOver={(e) => {
                if (plate.id !== selectedPlateId) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseOut={(e) => {
                if (plate.id !== selectedPlateId) {
                  e.currentTarget.style.borderColor = '#e5e0db';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <QRPreview plate={plate} />
              {renderControls(plate)}
            </div>

            {/* 가격 상세 표시 (카드 바깥 아래) */}
            {pricingSettings && (
              <div style={{
                fontSize: '12px',
                color: '#333',
                padding: '6px 8px',
                backgroundColor: isMobile ? 'rgba(249, 249, 249, 0.4)' : '#f9f9f9',
                border: '1px solid #e5e0db',
                borderRadius: '4px',
                ...(isMobile && {
                  textShadow: '0 0 6px rgba(255,255,255,0.9)'
                })
              }}>
                {/* 기본 가격 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>기본</span>
                  <span>{formatPrice(pricingSettings.base_price)}</span>
                </div>

                {/* 텍스트 추가 가격 */}
                {plate.text && plate.text.trim().length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>+ 텍스트</span>
                    <span>{formatPrice(pricingSettings.text_price)}</span>
                  </div>
                )}

                {/* 이미지 추가 가격 */}
                {plate.images.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>+ 이미지 {plate.images.length}개</span>
                    <span>{formatPrice(pricingSettings.image_price * plate.images.length)}</span>
                  </div>
                )}

                {/* 개당 가격 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  marginTop: '4px',
                  borderTop: '1px solid #e0e0e0',
                  fontWeight: 600,
                  color: '#333',
                }}>
                  <span>개당</span>
                  <span>{formatPrice(calculatePlatePrice(plate, pricingSettings))}</span>
                </div>

                {/* 총 가격 (수량 포함) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                  marginTop: '4px',
                  borderTop: '1px solid #e0e0e0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FF6B6B',
                }}>
                  <span>× {plate.quantity}개</span>
                  <span>{formatPrice(calculatePlatePrice(plate, pricingSettings) * plate.quantity)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* + 버튼 (새 Plate 추가) */}
        <div
          style={addButtonStyle}
          onClick={() => {
            const newPlate = addPlate();
            selectPlate(newPlate.id);
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#4A90E2';
            e.currentTarget.style.color = '#4A90E2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.color = '#999';
          }}
        >
          <div>+</div>
          <div style={{ fontSize: '14px', fontWeight: 400, marginTop: '4px' }}>새 QR 판</div>
        </div>
      </div>

      {/* 하단: 총합계 및 주문하기 버튼 */}
      <div style={{
        padding: isMobile ? '12px 20px' : '12px',
        borderTop: '2px solid #e5e0db',
        backgroundColor: isMobile ? 'rgba(249, 249, 249, 0.4)' : '#f9f9f9'
      }}>
        {/* 총합계 표시 */}
        {pricingSettings && plates.length > 0 && (
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.4)' : '#fff',
            border: '1px solid #e5e0db',
            borderRadius: '4px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#333',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>총 수량</span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>{totalQuantity}개</span>
            </div>
            {/* 제품 합계 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '4px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#666',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>제품 합계</span>
              <span style={{
                fontSize: '13px',
                color: '#666',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>
                {formatPrice(productTotal)}
              </span>
            </div>

            {/* 배송비 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '2px'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#666',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>배송비</span>
              <span style={{
                fontSize: '13px',
                color: '#666',
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' })
              }}>
                {formatPrice(SHIPPING_FEE)}
              </span>
            </div>

            {/* 총 금액 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              marginTop: '4px',
              borderTop: '2px solid #e0e0e0'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#333',
                ...(isMobile && { textShadow: '0 0 8px rgba(255,255,255,0.9)' })
              }}>총 금액</span>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FF6B6B',
                ...(isMobile && { textShadow: '0 0 8px rgba(255,255,255,0.9)' })
              }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* 주문하기 버튼 + 정보 아이콘 */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
          <button
            onClick={onCheckout}
            disabled={plates.length === 0}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: plates.length === 0 ? '#ccc' : '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: plates.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (plates.length > 0) {
                e.currentTarget.style.backgroundColor = '#FF5252';
              }
            }}
            onMouseOut={(e) => {
              if (plates.length > 0) {
                e.currentTarget.style.backgroundColor = '#FF6B6B';
              }
            }}
          >
            주문하기
          </button>

          {/* 주문 가능 정보 아이콘 */}
          <button
            onClick={() => setShowAvailabilityModal(true)}
            style={{
              width: '48px',
              padding: '14px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 700,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#357ABD';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4A90E2';
            }}
          >
            ⓘ
          </button>
        </div>

        {/* 주문 가능 정보 모달 */}
        {showAvailabilityModal && <AvailabilityBanner onClose={() => setShowAvailabilityModal(false)} />}
      </div>
    </div>
  );
}
