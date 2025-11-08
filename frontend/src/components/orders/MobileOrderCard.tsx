/**
 * 모바일 주문 카드 컴포넌트
 * MyOrders에서 추출
 */

import type { OrderGroupDetail } from '../../utils/api';
import { formatPrice } from '../../utils/pricing';
import { getStatusText, getStatusColor } from '../../utils/orderHelpers';

interface MobileOrderCardProps {
  orderGroup: OrderGroupDetail;
  onViewDetails: () => void;
  onCancel: () => void;
}

export const MobileOrderCard: React.FC<MobileOrderCardProps> = ({
  orderGroup,
  onViewDetails,
  onCancel,
}) => {
  const totalQuantity = orderGroup.line_items.reduce((sum, item) => sum + item.quantity, 0);
  const canCancel = orderGroup.status === 'pending' || orderGroup.status === 'paid';

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6',
      }}
    >
      {/* 주문번호 및 상태 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee',
      }}>
        <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
          {orderGroup.group_uuid.substring(0, 8)}...
        </div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: getStatusColor(orderGroup.status),
            color: 'white',
          }}
        >
          {getStatusText(orderGroup.status)}
        </span>
      </div>

      {/* 주문 정보 */}
      <div style={{ marginBottom: '10px', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#666' }}>주문일시</span>
          <span style={{ fontWeight: '500' }}>
            {orderGroup.created_at
              ? new Date(orderGroup.created_at).toLocaleDateString('ko-KR')
              : '-'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#666' }}>제품 종류</span>
          <span style={{ fontWeight: '500' }}>{orderGroup.line_items.length}개</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#666' }}>총 수량</span>
          <span style={{ fontWeight: '500' }}>{totalQuantity}개</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ color: '#888', fontSize: '13px' }}>제품 합계</span>
          <span style={{ color: '#888', fontSize: '13px' }}>
            {formatPrice(orderGroup.total_price - 5000)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#888', fontSize: '13px' }}>배송비</span>
          <span style={{ color: '#888', fontSize: '13px' }}>
            {formatPrice(5000)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px', borderTop: '1px solid #eee' }}>
          <span style={{ color: '#666', fontWeight: 'bold' }}>총 금액</span>
          <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '15px' }}>
            {formatPrice(orderGroup.total_price)}
          </span>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button
          onClick={onViewDetails}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          상세보기
        </button>
        {canCancel && (
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
};
