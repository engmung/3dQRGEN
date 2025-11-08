/**
 * OrderDetailModal Component
 * Displays detailed order information in a modal
 * Used by both Admin and MyOrders pages
 */

import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import CopyButton from '../common/CopyButton';
import { Badge } from '../common/Badge';
import { formatPrice } from '../../utils/formatters';
import { getStatusText, getStatusColor } from '../../utils/orderHelpers';
import { PRICING } from '../../constants/pricing';
import type { OrderGroupDetail } from '../../utils/api';

interface OrderDetailModalProps {
  orderGroup: OrderGroupDetail | null;
  onClose: () => void;
  isAdmin?: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  orderGroup,
  onClose,
  isAdmin = false,
}) => {
  if (!orderGroup) return null;

  const productTotal = orderGroup.total_price - PRICING.SHIPPING_FEE;

  // Generate filename (same logic as backend)
  const getFilename = (index: number, quantity: number): string => {
    const orderTime = orderGroup.created_at
      ? new Date(orderGroup.created_at).toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(/\. /g, '-').replace(/\./g, '').replace(/ /g, '_').replace(/:/g, '-')
      : 'unknown';

    const customerName = orderGroup.customer_name.replace(/ /g, '_');
    return `${customerName}_제품${index + 1}(x${quantity})_${orderTime}`;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="주문 상세 정보" width="800px">
      {/* Order Information */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#6c757d' }}>주문 정보</h3>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={styles.labelCell}>주문번호</td>
              <td style={styles.valueCell}>
                <code style={styles.code}>{orderGroup.group_uuid}</code>
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>주문일시</td>
              <td style={styles.valueCell}>
                {orderGroup.created_at
                  ? new Date(orderGroup.created_at).toLocaleString('ko-KR')
                  : '-'}
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>상태</td>
              <td style={styles.valueCell}>
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
              <td style={{ ...styles.labelCell, verticalAlign: 'top' }}>금액 상세</td>
              <td style={styles.valueCell}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={styles.priceRow}>
                    <span>제품 합계</span>
                    <span>{formatPrice(productTotal)}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span>배송비</span>
                    <span>{formatPrice(PRICING.SHIPPING_FEE)}</span>
                  </div>
                  <div style={{ ...styles.priceRow, ...styles.totalRow }}>
                    <span>총 금액</span>
                    <span>{formatPrice(orderGroup.total_price)}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Shipping Information */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#6c757d' }}>배송 정보</h3>
          {isAdmin && (
            <CopyButton
              value={`[${orderGroup.customer_postal_code}] ${orderGroup.customer_address}`}
              label="전체 주소 복사"
              size="sm"
            />
          )}
        </div>
        <table style={{ width: '100%', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={styles.labelCell}>이름</td>
              <td style={styles.valueCell}>{orderGroup.customer_name || '-'}</td>
            </tr>
            <tr>
              <td style={styles.labelCell}>이메일</td>
              <td style={styles.valueCell}>{orderGroup.customer_email || '-'}</td>
            </tr>
            <tr>
              <td style={styles.labelCell}>전화번호</td>
              <td style={styles.valueCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{orderGroup.customer_phone || '-'}</span>
                  {isAdmin && orderGroup.customer_phone && (
                    <CopyButton value={orderGroup.customer_phone} label="복사" size="sm" variant="ghost" />
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>우편번호</td>
              <td style={styles.valueCell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{orderGroup.customer_postal_code || '-'}</span>
                  {isAdmin && orderGroup.customer_postal_code && (
                    <CopyButton value={orderGroup.customer_postal_code} label="복사" size="sm" variant="ghost" />
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td style={styles.labelCell}>주소</td>
              <td style={styles.valueCell}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ flex: 1 }}>{orderGroup.customer_address || '-'}</span>
                  {isAdmin && orderGroup.customer_address && (
                    <CopyButton value={orderGroup.customer_address} label="복사" size="sm" variant="ghost" />
                  )}
                </div>
              </td>
            </tr>
            {orderGroup.delivery_message && (
              <tr>
                <td style={styles.labelCell}>배송 메시지</td>
                <td style={{ ...styles.valueCell, whiteSpace: 'pre-wrap' }}>
                  {orderGroup.delivery_message}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#6c757d' }}>
          주문 제품 ({orderGroup.line_items.length}개)
        </h3>
        <div style={styles.itemsContainer}>
          {orderGroup.line_items.map((item, index) => {
            const baseFilename = getFilename(index, item.quantity);

            return (
              <div key={item.id} style={{
                ...styles.itemCard,
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>제품 #{index + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                    {formatPrice(item.total_price)}
                  </span>
                </div>

                {/* Filename Info (Admin only) */}
                {isAdmin && (
                  <div style={styles.filenameBox}>
                    <div style={styles.filenameLabel}>파일명</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <code style={styles.filenameCode}>{baseFilename}.obj</code>
                      <CopyButton value={`${baseFilename}.obj`} label="복사" size="sm" variant="ghost" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={styles.filenameCode}>{baseFilename}.mtl</code>
                      <CopyButton value={`${baseFilename}.mtl`} label="복사" size="sm" variant="ghost" />
                    </div>
                  </div>
                )}

                <table style={{ width: '100%', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={styles.itemLabelCell}>수량</td>
                      <td style={{ ...styles.itemValueCell, fontWeight: 'bold' }}>{item.quantity}개</td>
                    </tr>
                    <tr>
                      <td style={styles.itemLabelCell}>단가</td>
                      <td style={styles.itemValueCell}>{formatPrice(item.unit_price)}</td>
                    </tr>
                    <tr>
                      <td style={styles.itemLabelCell}>QR URL</td>
                      <td style={{ ...styles.itemValueCell, wordBreak: 'break-all', fontSize: '12px' }}>
                        {item.qr_url}
                      </td>
                    </tr>
                    {item.customization?.text && (
                      <tr>
                        <td style={styles.itemLabelCell}>텍스트</td>
                        <td style={styles.itemValueCell}>{item.customization.text}</td>
                      </tr>
                    )}
                    {item.customization?.images && item.customization.images.length > 0 && (
                      <tr>
                        <td style={styles.itemLabelCell}>이미지</td>
                        <td style={styles.itemValueCell}>{item.customization.images.length}개</td>
                      </tr>
                    )}
                    <tr>
                      <td style={styles.itemLabelCell}>Line Item ID</td>
                      <td style={styles.itemValueCell}>
                        <code style={{ fontSize: '11px', color: '#666' }}>
                          {item.line_item_uuid.substring(0, 8)}...
                        </code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} variant="secondary">
          닫기
        </Button>
      </div>
    </Modal>
  );
};

const styles = {
  labelCell: {
    padding: '8px 0',
    fontWeight: 'bold' as const,
    width: '120px',
  },
  valueCell: {
    padding: '8px 0',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f5f5f5',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
  },
  totalRow: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#007bff',
    paddingTop: '4px',
    borderTop: '1px solid #eee',
  },
  itemsContainer: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
    border: '1px solid #dee2e6',
    borderRadius: '4px',
  },
  itemCard: {
    padding: '15px',
    borderBottom: '1px solid #dee2e6',
  },
  filenameBox: {
    marginBottom: '10px',
    padding: '8px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    border: '1px solid #90caf9',
  },
  filenameLabel: {
    fontSize: '11px',
    color: '#1976d2',
    fontWeight: 'bold' as const,
    marginBottom: '4px',
  },
  filenameCode: {
    fontSize: '11px',
    backgroundColor: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'block',
  },
  itemLabelCell: {
    padding: '4px 0',
    width: '100px',
    color: '#666',
  },
  itemValueCell: {
    padding: '4px 0',
  },
};
