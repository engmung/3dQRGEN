/**
 * OrderManagement Component
 * Manages order list, filtering, sorting, status changes, and bulk actions
 */

import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../common/Button';
import { FormSelect, type FormSelectOption } from '../common/FormSelect';
import { FormField } from '../common/FormField';
import { OrderDetailModal } from './OrderDetailModal';
import { formatPrice } from '../../utils/formatters';
import { getOrderGroupDownloadUrl, deleteOrderGroup, updateOrderGroupStatus, type OrderGroupDetail } from '../../utils/api';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface OrderManagementProps {
  orderGroups: OrderGroupDetail[];
  onReload: () => Promise<void>;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orderGroups, onReload }) => {
  const isMobile = useIsMobile();
  const { getToken } = useAuth();

  // State
  const [selectedOrderGroups, setSelectedOrderGroups] = useState<Set<string>>(new Set());
  const [selectedOrderGroupDetail, setSelectedOrderGroupDetail] = useState<OrderGroupDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Status filter options
  const statusOptions: FormSelectOption[] = [
    { value: 'all', label: '전체 보기' },
    { value: 'pending', label: '입금 대기' },
    { value: 'in_production', label: '제작 중' },
    { value: 'shipped', label: '배송 중' },
    { value: 'completed', label: '배송 완료' },
    { value: 'failed', label: '취소됨' },
  ];

  // Sort options
  const sortOptions: FormSelectOption[] = [
    { value: 'date', label: '주문 일시' },
    { value: 'price', label: '가격' },
    { value: 'status', label: '상태' },
  ];

  // Filtering and sorting
  const getFilteredAndSortedOrders = () => {
    let filtered = orderGroups;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(og => og.status === statusFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(og =>
        og.customer_name.toLowerCase().includes(query) ||
        og.customer_phone.includes(query) ||
        og.customer_address.toLowerCase().includes(query) ||
        og.group_uuid.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'price':
          comparison = a.total_price - b.total_price;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedOrderGroups.size === orderGroups.length) {
      setSelectedOrderGroups(new Set());
    } else {
      setSelectedOrderGroups(new Set(orderGroups.map(og => og.group_uuid)));
    }
  };

  const handleSelectOrderGroup = (groupUuid: string) => {
    const newSelected = new Set(selectedOrderGroups);
    if (newSelected.has(groupUuid)) {
      newSelected.delete(groupUuid);
    } else {
      newSelected.add(groupUuid);
    }
    setSelectedOrderGroups(newSelected);
  };

  // Action handlers
  const handleDeleteOrderGroup = async (groupUuid: string) => {
    if (!confirm('정말로 이 주문을 삭제하시겠습니까?\nOBJ 파일과 모든 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      const token = await getToken();
      await deleteOrderGroup(groupUuid, token);
      alert('주문이 삭제되었습니다.');
      await onReload();
    } catch (err: any) {
      alert('주문 삭제 실패: ' + err.message);
    }
  };

  const handleConfirmPayment = async (groupUuid: string) => {
    if (!confirm('입금을 확인했습니까?\n(자동으로 제작 중 상태로 변경됩니다)')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'in_production', token);
      alert('입금 확인 및 제작 중으로 표시되었습니다.');
      await onReload();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleStartShipping = async (groupUuid: string) => {
    if (!confirm('배송을 시작하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'shipped', token);
      alert('배송 시작으로 표시되었습니다.');
      await onReload();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleCompleteOrder = async (groupUuid: string) => {
    if (!confirm('배송을 완료하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'completed', token);
      alert('배송 완료로 표시되었습니다.');
      await onReload();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleCancelOrder = async (groupUuid: string) => {
    if (!confirm('이 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'failed', token);
      alert('주문이 취소되었습니다.');
      await onReload();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedOrderGroups.size === 0) {
      alert('삭제할 주문을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrderGroups.size}개의 주문을 삭제하시겠습니까?\nOBJ 파일과 모든 데이터가 삭제됩니다.`)) {
      return;
    }

    try {
      const token = await getToken();
      let successCount = 0;
      let failCount = 0;

      for (const groupUuid of selectedOrderGroups) {
        try {
          await deleteOrderGroup(groupUuid, token);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete order group ${groupUuid}:`, err);
          failCount++;
        }
      }

      alert(`${successCount}개 삭제 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`);
      setSelectedOrderGroups(new Set());
      await onReload();
    } catch (err: any) {
      alert('일괄 삭제 실패: ' + err.message);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedOrderGroups.size === 0) {
      alert('상태를 변경할 주문을 선택해주세요.');
      return;
    }

    // Analyze selected orders
    const selectedOrders = orderGroups.filter(og => selectedOrderGroups.has(og.group_uuid));
    const statuses = new Set(selectedOrders.map(og => og.status));

    // Determine next status
    let nextStatus: string | null = null;
    let statusLabel = '';

    if (statuses.size === 1) {
      const currentStatus = Array.from(statuses)[0];
      switch (currentStatus) {
        case 'pending':
          nextStatus = 'in_production';
          statusLabel = '제작 중';
          break;
        case 'in_production':
          nextStatus = 'shipped';
          statusLabel = '배송 중';
          break;
        case 'shipped':
          nextStatus = 'completed';
          statusLabel = '배송 완료';
          break;
        default:
          alert('더 이상 진행할 수 없는 상태입니다.');
          return;
      }
    } else {
      alert('같은 상태의 주문만 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrderGroups.size}개 주문을 "${statusLabel}" 상태로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const token = await getToken();
      let successCount = 0;
      let failCount = 0;

      for (const groupUuid of selectedOrderGroups) {
        try {
          await updateOrderGroupStatus(groupUuid, nextStatus, token);
          successCount++;
        } catch (err) {
          console.error(`Failed to update order group ${groupUuid}:`, err);
          failCount++;
        }
      }

      alert(`${successCount}개 상태 변경 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`);
      setSelectedOrderGroups(new Set());
      await onReload();
    } catch (err: any) {
      alert('일괄 상태 변경 실패: ' + err.message);
    }
  };

  const filteredOrders = getFilteredAndSortedOrders();

  return (
    <div>
      <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>주문 목록</h2>

      {/* Filter Controls */}
      <div style={styles.filterBox}>
        <div style={styles.filterGrid}>
          {/* Status Filter */}
          <FormSelect
            label="상태 필터"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />

          {/* Sort */}
          <div>
            <label style={styles.label}>정렬 기준</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'status')}
                style={styles.select}
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={styles.sortButton}
                title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Search */}
          <FormField
            label="검색"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="고객명, 전화번호, 주소, UUID..."
          />
        </div>
      </div>

      {/* Summary and Bulk Actions */}
      <div style={styles.summaryBox}>
        <p style={styles.summaryText}>
          총 주문 수: <strong>{orderGroups.length}</strong>개 | 필터링 결과: <strong>{filteredOrders.length}</strong>개 | 선택된 주문: <strong>{selectedOrderGroups.size}</strong>개
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button onClick={handleSelectAll} variant="secondary" size="sm">
            {selectedOrderGroups.size === orderGroups.length ? '전체 해제' : '전체 선택'}
          </Button>
          <Button
            onClick={handleBulkStatusChange}
            disabled={selectedOrderGroups.size === 0}
            variant="primary"
            size="sm"
          >
            상태 진행 ({selectedOrderGroups.size})
          </Button>
          <Button
            onClick={handleBulkDelete}
            disabled={selectedOrderGroups.size === 0}
            variant="danger"
            size="sm"
          >
            선택 삭제 ({selectedOrderGroups.size})
          </Button>
        </div>
      </div>

      {/* Order Table */}
      {orderGroups.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '18px', color: '#888' }}>아직 주문이 없습니다.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={headerStyle}>
                  <input
                    type="checkbox"
                    checked={selectedOrderGroups.size === orderGroups.length && orderGroups.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={headerStyle}>ID</th>
                <th style={headerStyle}>주문 번호</th>
                <th style={headerStyle}>제품 종류</th>
                <th style={headerStyle}>총 수량</th>
                <th style={headerStyle}>고객명</th>
                <th style={headerStyle}>전화번호</th>
                <th style={headerStyle}>우편번호</th>
                <th style={headerStyle}>주소</th>
                <th style={headerStyle}>금액</th>
                <th style={headerStyle}>상태</th>
                <th style={headerStyle}>주문일시</th>
                <th style={headerStyle}>ZIP</th>
                <th style={headerStyle}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((orderGroup) => {
                const totalQuantity = orderGroup.line_items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr
                    key={orderGroup.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: selectedOrderGroups.has(orderGroup.group_uuid) ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <td style={cellStyle}>
                      <input
                        type="checkbox"
                        checked={selectedOrderGroups.has(orderGroup.group_uuid)}
                        onChange={() => handleSelectOrderGroup(orderGroup.group_uuid)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={cellStyle}>{orderGroup.id}</td>
                    <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                      {orderGroup.group_uuid.substring(0, 8)}...
                    </td>
                    <td style={cellStyle}>{orderGroup.line_items.length}개</td>
                    <td style={{ ...cellStyle, fontWeight: 'bold' }}>{totalQuantity}개</td>
                    <td style={cellStyle}>{orderGroup.customer_name}</td>
                    <td style={cellStyle}>{orderGroup.customer_phone || '-'}</td>
                    <td style={cellStyle}>{orderGroup.customer_postal_code || '-'}</td>
                    <td style={{ ...cellStyle, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {orderGroup.customer_address || '-'}
                    </td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          제품: {formatPrice(orderGroup.total_price - 5000)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          배송: {formatPrice(5000)}
                        </span>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#007bff' }}>
                          {formatPrice(orderGroup.total_price)}
                        </span>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          orderGroup.status === 'completed' ? '#e3f2fd' :
                          orderGroup.status === 'paid' ? '#e7f5e7' :
                          '#f5f5f5',
                        color:
                          orderGroup.status === 'completed' ? '#1976d2' :
                          orderGroup.status === 'paid' ? '#4CAF50' :
                          '#888'
                      }}>
                        {orderGroup.status}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      {orderGroup.created_at ? new Date(orderGroup.created_at).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td style={cellStyle}>
                      <a
                        href={getOrderGroupDownloadUrl(orderGroup.group_uuid)}
                        download
                        style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        다운로드
                      </a>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => setSelectedOrderGroupDetail(orderGroup)} style={actionButtonStyle('#007bff')}>
                          상세보기
                        </button>
                        {orderGroup.status === 'pending' && (
                          <button onClick={() => handleConfirmPayment(orderGroup.group_uuid)} style={actionButtonStyle('#fd7e14')}>
                            입금 확인
                          </button>
                        )}
                        {orderGroup.status === 'in_production' && (
                          <button onClick={() => handleStartShipping(orderGroup.group_uuid)} style={actionButtonStyle('#007bff')}>
                            배송 시작
                          </button>
                        )}
                        {orderGroup.status === 'shipped' && (
                          <button onClick={() => handleCompleteOrder(orderGroup.group_uuid)} style={actionButtonStyle('#28a745')}>
                            배송 완료
                          </button>
                        )}
                        {orderGroup.status !== 'completed' && orderGroup.status !== 'failed' && (
                          <button onClick={() => handleCancelOrder(orderGroup.group_uuid)} style={actionButtonStyle('#ff9800')}>
                            취소
                          </button>
                        )}
                        <button onClick={() => handleDeleteOrderGroup(orderGroup.group_uuid)} style={actionButtonStyle('#f44336')}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderGroup={selectedOrderGroupDetail}
        onClose={() => setSelectedOrderGroupDetail(null)}
        isAdmin={true}
      />
    </div>
  );
};

const styles = {
  filterBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #ddd',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '14px',
  },
  select: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  sortButton: {
    padding: '10px 15px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontWeight: 'bold' as const,
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
};

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#333'
};

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#666'
};

const actionButtonStyle = (color: string): React.CSSProperties => ({
  padding: '4px 8px',
  fontSize: '12px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});
