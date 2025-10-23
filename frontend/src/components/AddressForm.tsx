import React, { useState, useEffect } from 'react';
import DaumPostcode from 'react-daum-postcode';
import { formatPrice } from '../utils/pricing';

export interface AddressFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  deliveryMessage: string;
}

interface AddressFormProps {
  initialData: Partial<AddressFormData>;
  price: number;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'addressFormData';

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  price,
  onSubmit,
  onCancel,
}) => {
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>주문/배송 정보 입력</h2>

        <form onSubmit={handleSubmit}>
          {/* 이름 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              이름 *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* 이메일 (읽기 전용) */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              이메일 *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              readOnly
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
              }}
            />
          </div>

          {/* 전화번호 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              전화번호 * (예: 010-1234-5678)
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="010-1234-5678"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* 우편번호 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPostcode(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                우편번호 검색
              </button>
            </div>
          </div>

          {/* 주소 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              주소 *
            </label>
            <input
              type="text"
              value={formData.address}
              readOnly
              placeholder="우편번호 검색 후 자동 입력됩니다"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
              }}
            />
          </div>

          {/* 상세주소 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              상세주소 *
            </label>
            <input
              type="text"
              value={formData.detailAddress}
              onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
              placeholder="상세주소를 입력해주세요"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* 배송 메시지 */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              배송 메시지 (선택)
            </label>
            <textarea
              value={formData.deliveryMessage}
              onChange={(e) => setFormData({ ...formData, deliveryMessage: e.target.value })}
              placeholder="공동현관 비밀번호, 부재 시 조치 사항 등을 입력해주세요"
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* 가격 표시 */}
          <div
            style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>주문 금액</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {formatPrice(price)}
              </span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#000' }}>💳 입금 계좌</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000' }}>
                국민은행 123-456-789012
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '10px' }}>
                예금주: 홍길동
              </div>
              <div style={{ fontSize: '13px', color: '#6c757d', lineHeight: '1.5' }}>
                ℹ️ 입금 확인 후 제작이 시작됩니다.<br />
                주문 진행 상황은 '내 주문' 메뉴에서 확인하세요.
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
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
            }}
          >
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
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
                }}
              >
                닫기
              </button>
              <h3 style={{ margin: 0 }}>우편번호 검색</h3>
            </div>
            <DaumPostcode onComplete={handlePostcodeComplete} />
          </div>
        )}
      </div>
    </div>
  );
};
