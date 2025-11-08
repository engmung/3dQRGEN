/**
 * 주문 상세 모달 컴포넌트
 * MyOrders와 Admin에서 사용
 */

import type { OrderGroupDetail } from '../../utils/api';
import { formatPrice } from '../../utils/pricing';
import { getStatusText, getStatusColor } from '../../utils/orderHelpers';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../../styles/modalStyles';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface OrderDetailModalProps {
  orderGroup: OrderGroupDetail | null;
  onClose: () => void;
  onCancel?: (groupUuid: string) => void;
  showCancelButton?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderGroup,
  onClose,
  onCancel,
  showCancelButton = true,
}) => {
  const isMobile = useIsMobile();

  if (!orderGroup) return null;

  const canCancel = showCancelButton && orderGroup.status === 'pending' && onCancel;

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div
        style={{
          ...MODAL_CONTENT_LARGE,
          width: isMobile ? '95vw' : '90vw',
          maxWidth: isMobile ? '95vw' : '1200px',
          padding: isMobile ? '15px' : '30px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>주문 상세 정보</h2>

        {/* 주문 정보 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 정보</h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>주문번호</td>
                <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>
                  {orderGroup.group_uuid}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주문일시</td>
                <td style={{ padding: '8px 0' }}>
                  {orderGroup.created_at
                    ? new Date(orderGroup.created_at).toLocaleString('ko-KR')
                    : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>상태</td>
                <td style={{ padding: '8px 0' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(orderGroup.status),
                      color: 'white',
                    }}
                  >
                    {getStatusText(orderGroup.status)}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', verticalAlign: 'top' }}>금액 상세</td>
                <td style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                      <span>제품 합계</span>
                      <span>{formatPrice(orderGroup.total_price - 5000)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                      <span>배송비</span>
                      <span>{formatPrice(5000)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#007bff', paddingTop: '4px', borderTop: '1px solid #eee' }}>
                      <span>총 금액</span>
                      <span>{formatPrice(orderGroup.total_price)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 배송 정보 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>배송 정보</h3>
          <table style={{ width: '100%', fontSize: '14px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>이름</td>
                <td style={{ padding: '8px 0' }}>{orderGroup.customer_name || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>전화번호</td>
                <td style={{ padding: '8px 0' }}>{orderGroup.customer_phone || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>우편번호</td>
                <td style={{ padding: '8px 0' }}>{orderGroup.customer_postal_code || '-'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주소</td>
                <td style={{ padding: '8px 0' }}>{orderGroup.customer_address || '-'}</td>
              </tr>
              {orderGroup.delivery_message && (
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>배송 메시지</td>
                  <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{orderGroup.delivery_message}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 주문 제품 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 제품 ({orderGroup.line_items.length}개)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            {orderGroup.line_items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  padding: '15px',
                  borderBottom: index < orderGroup.line_items.length - 1 ? '1px solid #dee2e6' : 'none',
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>제품 #{index + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                    {formatPrice(item.total_price)}
                  </span>
                </div>
                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', width: '100px', color: '#666' }}>수량</td>
                      <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{item.quantity}개</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#666' }}>단가</td>
                      <td style={{ padding: '4px 0' }}>{formatPrice(item.unit_price)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: '#666' }}>QR URL</td>
                      <td style={{ padding: '4px 0', wordBreak: 'break-all', fontSize: '12px' }}>
                        {item.qr_url}
                      </td>
                    </tr>
                    {(item.customization?.plateColor || item.customization?.qrColor) && (
                      <tr>
                        <td style={{ padding: '4px 0', color: '#666' }}>색상</td>
                        <td style={{ padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.customization?.plateColor && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: item.customization.plateColor,
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                  }}
                                />
                                <span style={{ fontSize: '13px' }}>색상1</span>
                              </div>
                            )}
                            {item.customization?.qrColor && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: item.customization.qrColor,
                                    border: '2px solid #ddd',
                                    borderRadius: '4px',
                                  }}
                                />
                                <span style={{ fontSize: '13px' }}>색상2 (QR, 이미지, 텍스트)</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {item.customization?.text && (
                      <tr>
                        <td style={{ padding: '4px 0', color: '#666' }}>텍스트</td>
                        <td style={{ padding: '4px 0' }}>{item.customization.text}</td>
                      </tr>
                    )}
                    {item.customization?.images && item.customization.images.length > 0 && (
                      <tr>
                        <td style={{ padding: '4px 0', color: '#666' }}>이미지</td>
                        <td style={{ padding: '4px 0' }}>{item.customization.images.length}개</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {canCancel && (
            <button
              onClick={() => onCancel!(orderGroup.group_uuid)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              주문 취소
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
