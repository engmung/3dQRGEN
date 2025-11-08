/**
 * 데스크톱 주문 테이블 행 컴포넌트
 * MyOrders에서 추출
 */

import { useState } from 'react';
import type { OrderGroupDetail } from '../../utils/api';
import { formatPrice } from '../../utils/pricing';
import { getStatusText, getStatusColor } from '../../utils/orderHelpers';

interface OrderTableRowProps {
  orderGroup: OrderGroupDetail;
  onViewDetails: () => void;
  onCancel: () => void;
}

export const OrderTableRow: React.FC<OrderTableRowProps> = ({
  orderGroup,
  onViewDetails,
  onCancel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const totalQuantity = orderGroup.line_items.reduce((sum, item) => sum + item.quantity, 0);
  const canCancel = orderGroup.status === 'pending' || orderGroup.status === 'paid';

  return (
    <tr
      style={{
        borderBottom: '1px solid #dee2e6',
        backgroundColor: isHovered ? '#f8f9fa' : 'white',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={{ padding: '15px', fontSize: '14px', fontFamily: 'monospace' }}>
        {orderGroup.group_uuid.substring(0, 8)}...
      </td>
      <td style={{ padding: '15px', fontSize: '14px' }}>
        {orderGroup.created_at
          ? new Date(orderGroup.created_at).toLocaleString('ko-KR')
          : '-'}
      </td>
      <td style={{ padding: '15px', fontSize: '14px', textAlign: 'center' }}>
        {orderGroup.line_items.length}개
      </td>
      <td style={{ padding: '15px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>
        {totalQuantity}개
      </td>
      <td style={{ padding: '15px', fontSize: '14px', textAlign: 'right' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>
            제품: {formatPrice(orderGroup.total_price - 5000)}
          </span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            배송: {formatPrice(5000)}
          </span>
          <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#007bff' }}>
            {formatPrice(orderGroup.total_price)}
          </span>
        </div>
      </td>
      <td style={{ padding: '15px', textAlign: 'center' }}>
        <span
          style={{
            padding: '6px 12px',
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
      <td style={{ padding: '15px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          <button
            onClick={onViewDetails}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            상세보기
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              취소
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
