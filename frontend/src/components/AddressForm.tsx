import React, { useState, useEffect } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { formatPrice, calculatePlatePrice, getPricingSettings } from '../utils/pricing';
import { CustomerCalendar } from './CustomerCalendar';
import type { QRPlateConfig } from '../store/useDesignStore';
import { getQRTypeLabel } from '../utils/qrHelpers';
import { useIsMobile } from '../hooks/useMediaQuery';

export interface AddressFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMessage: string;
  // productionDate 제거됨 (서버가 자동 배분)
}

interface CartItem {
  id: string;
  plateConfig: QRPlateConfig;
  quantity: number;
}

interface AddressFormProps {
  initialData: Partial<AddressFormData>;
  price: number;
  productTotal: number; // 제품 합계 (택배비 제외)
  shippingFee: number; // 택배비
  totalQuantity: number; // 총 제품 개수
  cartItems: CartItem[]; // 추가: 가격 상세를 위해 필요
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

  useEffect(() => {
    getPricingSettings().then(setPricingSettings);
  }, []);
  // localStorage에서 저장된 데이터 불러오기
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
    customerEmail: initialData.customerEmail || '', // 이메일은 항상 현재 로그인 정보 사용
    customerPhone: savedData.customerPhone || initialData.customerPhone || '',
    postalCode: savedData.postalCode || initialData.postalCode || '',
    address: savedData.address || initialData.address || '',
    detailAddress: savedData.detailAddress || initialData.detailAddress || '',
    deliveryMessage: savedData.deliveryMessage || initialData.deliveryMessage || '',
  });

  // formData 변경 시 localStorage에 자동 저장 (이메일 제외)
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

  const [showPostcode, setShowPostcode] = useState(false);

  // 우편번호 검색 완료 핸들러
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!formData.customerName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!formData.customerEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }
    if (!formData.customerPhone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    if (!formData.postalCode.trim()) {
      alert('우편번호를 검색해주세요.');
      return;
    }
    if (!formData.detailAddress.trim()) {
      alert('상세주소를 입력해주세요.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: isMobile ? '8px' : '30px',
      }}
    >
      <h2 style={{
        marginTop: 0,
        marginBottom: isMobile ? '10px' : '20px',
        color: '#333',
        fontSize: isMobile ? '16px' : '20px',
        fontWeight: 700
      }}>
        📝 배송 정보 입력
      </h2>

        <form onSubmit={handleSubmit}>
          {/* 고객 정보 입력 */}
          <div style={{
            marginBottom: isMobile ? '10px' : '20px'
          }}>
          {/* 이름 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              이름 *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 이메일 (읽기 전용) */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              이메일 *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              readOnly
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 전화번호 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              전화번호 * (예: 010-1234-5678)
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
                let formatted = value;

                // 자동 하이픈 추가
                if (value.length <= 3) {
                  formatted = value;
                } else if (value.length <= 7) {
                  formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
                } else if (value.length <= 11) {
                  formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
                } else {
                  formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
                }

                setFormData({ ...formData, customerPhone: formatted });
              }}
              placeholder="010-1234-5678"
              maxLength={13}
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 우편번호 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              우편번호 *
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={formData.postalCode}
                readOnly
                placeholder="우편번호"
                style={{
                  flex: 1,
                  padding: isMobile ? '4px 6px' : '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  fontSize: isMobile ? '13px' : '16px',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPostcode(true)}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile ? '검색' : '우편번호 검색'}
              </button>
            </div>
          </div>

          {/* 주소 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              주소 *
            </label>
            <input
              type="text"
              value={formData.address}
              readOnly
              placeholder="우편번호 검색 후 자동 입력됩니다"
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 상세주소 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              상세주소 *
            </label>
            <input
              type="text"
              value={formData.detailAddress}
              onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
              placeholder="상세주소를 입력해주세요"
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 배송 메시지 */}
          <div style={{ marginBottom: isMobile ? '8px' : '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: isMobile ? '13px' : '14px'
            }}>
              배송 메시지 (선택)
            </label>
            <textarea
              value={formData.deliveryMessage}
              onChange={(e) => setFormData({ ...formData, deliveryMessage: e.target.value })}
              placeholder="공동현관 비밀번호, 부재 시 조치 사항 등을 입력해주세요"
              rows={isMobile ? 2 : 3}
              style={{
                width: '100%',
                padding: isMobile ? '4px 6px' : '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical',
                fontSize: isMobile ? '13px' : '16px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          </div>

          {/* 캘린더 (읽기 전용) */}
          <div style={{
            marginBottom: isMobile ? '10px' : '20px'
          }}>
            <CustomerCalendar
              totalQuantity={totalQuantity}
              readOnly={true}
            />
          </div>

          {/* 가격 상세 및 입금 정보 (전체 너비) */}
          <div
            style={{
              marginBottom: isMobile ? '10px' : '20px',
              padding: isMobile ? '10px' : '20px',
              backgroundColor: '#faf9f7',
              borderRadius: '8px',
              border: '2px solid #e5e0db',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {/* 주문 금액 상세 */}
            <div style={{ marginBottom: isMobile ? '15px' : '20px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: isMobile ? '15px' : '18px',
                fontWeight: 700,
                color: '#333'
              }}>
                💰 주문 금액 상세
              </h3>

              {pricingSettings && cartItems.map((item, index) => {
                const itemPrice = calculatePlatePrice(item.plateConfig, pricingSettings);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    style={{
                      marginBottom: '12px',
                      padding: isMobile ? '10px' : '12px',
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #e5e0db',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '5px' }}>
                      <span style={{ fontWeight: 600, color: '#333', fontSize: isMobile ? '14px' : '16px' }}>
                        #{index + 1} {getQRTypeLabel(item.plateConfig.qrType)} QR × {item.quantity}개
                      </span>
                      <span style={{ fontWeight: 700, color: '#FF6B6B', fontSize: isMobile ? '16px' : '18px' }}>
                        {formatPrice(itemTotal)}
                      </span>
                    </div>

                    <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666', paddingLeft: isMobile ? '4px' : '8px' }}>
                      <div>기본: {formatPrice(pricingSettings.base_price)}</div>
                      {item.plateConfig.text && item.plateConfig.text.trim().length > 0 && (
                        <div>+ 텍스트: {formatPrice(pricingSettings.text_price)}</div>
                      )}
                      {item.plateConfig.images.length > 0 && (
                        <div>+ 이미지 {item.plateConfig.images.length}개: {formatPrice(pricingSettings.image_price * item.plateConfig.images.length)}</div>
                      )}
                      <div style={{ marginTop: '4px', color: '#333', fontWeight: 600 }}>
                        = {formatPrice(itemPrice)} × {item.quantity}개
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 제품 합계 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '2px solid #e5e0db'
              }}>
                <span style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 600,
                  color: '#666'
                }}>제품 합계</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 600,
                  color: '#666'
                }}>
                  {formatPrice(productTotal)}
                </span>
              </div>

              {/* 배송비 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <span style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: 600,
                  color: '#666'
                }}>배송비</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 600,
                  color: '#666'
                }}>
                  {formatPrice(shippingFee)}
                </span>
              </div>

              {/* 총 결제 금액 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '2px solid #333'
              }}>
                <span style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>총 결제 금액</span>
                <span style={{
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: 'bold',
                  color: '#FF6B6B'
                }}>
                  {formatPrice(price)}
                </span>
              </div>
            </div>

            {/* 입금 계좌 */}
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>💳</span>
                <span>입금 계좌 정보</span>
              </div>

              <div style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e0db',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>은행명</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>신한은행</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('신한은행');
                      alert('은행명이 복사되었습니다');
                    }}
                    style={{
                      padding: isMobile ? '10px 16px' : '6px 12px',
                      fontSize: isMobile ? '14px' : '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      minWidth: isMobile ? '70px' : 'auto',
                    }}
                  >
                    📋 복사
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>계좌번호</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', fontFamily: 'monospace' }}>
                      110-548-406070
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('110548406070');
                      alert('계좌번호가 복사되었습니다');
                    }}
                    style={{
                      padding: isMobile ? '10px 16px' : '6px 12px',
                      fontSize: isMobile ? '14px' : '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      minWidth: isMobile ? '70px' : 'auto',
                    }}
                  >
                    📋 복사
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>예금주</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>이승훈</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('이승훈');
                      alert('예금주명이 복사되었습니다');
                    }}
                    style={{
                      padding: isMobile ? '10px 16px' : '6px 12px',
                      fontSize: isMobile ? '14px' : '12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      minWidth: isMobile ? '70px' : 'auto',
                    }}
                  >
                    📋 복사
                  </button>
                </div>
              </div>

              {/* 전체 복사 버튼 */}
              <button
                type="button"
                onClick={() => {
                  const accountInfo = `신한은행 110-548-406070 (예금주: 이승훈)\n입금액: ${formatPrice(price)}`;
                  navigator.clipboard.writeText(accountInfo);
                  alert('전체 입금 정보가 복사되었습니다');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '15px'
                }}
              >
                📋 전체 계좌정보 복사하기
              </button>

              {/* 안내 메시지 */}
              <div style={{
                padding: '12px',
                backgroundColor: '#f5f3f0',
                borderRadius: '6px',
                border: '1px solid #e5e0db'
              }}>
                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                  ℹ️ <strong style={{ color: '#333' }}>주문 진행 안내</strong><br />
                  • 입금 확인 후 생산이 시작됩니다<br />
                  • 입금자명은 주문자명과 동일하게 해주세요<br />
                  • 주문 진행 상황은 '내 주문' 메뉴에서 확인 가능합니다<br />
                  • 입금 확인은 영업일 기준 24시간 이내 처리됩니다
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                backgroundColor: '#999',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: isMobile ? '10px 20px' : '12px 24px',
                backgroundColor: '#FF6B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 600,
              }}
            >
              주문하기
            </button>
          </div>
        </form>

        {/* 우편번호 검색 모달 */}
        {showPostcode && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              border: '1px solid #000',
              zIndex: 2000,
              width: isMobile ? '95%' : 'auto',
              maxWidth: isMobile ? '95vw' : '600px',
              maxHeight: isMobile ? '90vh' : 'auto',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #ccc',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setShowPostcode(false)}
                style={{
                  float: 'right',
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                }}
              >
                닫기
              </button>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '14px' : '16px',
              }}>우편번호 검색</h3>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <DaumPostcode onComplete={handlePostcodeComplete} />
            </div>
          </div>
        )}
    </div>
  );
};
