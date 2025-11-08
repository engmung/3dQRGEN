import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchMyOrderGroups, cancelOrderGroup, type OrderGroupDetail } from '../utils/api';
import { useIsMobile } from '../hooks/useMediaQuery';
import { MobileOrderCard } from '../components/orders/MobileOrderCard';
import { OrderTableRow } from '../components/orders/OrderTableRow';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

interface MyOrdersProps {
  onLoadingComplete?: () => void;
}

export const MyOrders = ({ onLoadingComplete }: MyOrdersProps = {}) => {
  const isMobile = useIsMobile();
  const { getToken } = useAuth();
  const [orderGroups, setOrderGroups] = useState<OrderGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderGroup, setSelectedOrderGroup] = useState<OrderGroupDetail | null>(null);

  useEffect(() => {
    loadOrderGroups();
  }, []);

  // 페이지 로딩 완료 시 알림
  useEffect(() => {
    if (!loading && onLoadingComplete) {
      onLoadingComplete();
    }
  }, [loading, onLoadingComplete]);

  const loadOrderGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await fetchMyOrderGroups(token);
      setOrderGroups(data);
    } catch (err) {
      console.error('Failed to load order groups:', err);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrderGroup = async (groupUuid: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await cancelOrderGroup(groupUuid, token);
      alert('주문이 취소되었습니다.');
      await loadOrderGroups();
      setSelectedOrderGroup(null);
    } catch (err: any) {
      alert(err.message || '주문 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
        <p>{error}</p>
        <button
          onClick={loadOrderGroups}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '15px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '20px' : '30px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMobile ? '20px' : '32px'
        }}>내 주문 내역</h1>
      </div>

      {orderGroups.length === 0 ? (
        <div
          style={{
            padding: isMobile ? '40px 20px' : '60px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#6c757d'
          }}>주문 내역이 없습니다.</p>
        </div>
      ) : isMobile ? (
        /* 모바일: 카드 레이아웃 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orderGroups.map((orderGroup) => (
            <MobileOrderCard
              key={orderGroup.id}
              orderGroup={orderGroup}
              onViewDetails={() => setSelectedOrderGroup(orderGroup)}
              onCancel={() => handleCancelOrderGroup(orderGroup.group_uuid)}
            />
          ))}
        </div>
      ) : (
        /* PC: 테이블 레이아웃 */
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>주문번호</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>주문일시</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>제품 종류</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>총 수량</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>금액</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>상태</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {orderGroups.map((orderGroup) => (
                <OrderTableRow
                  key={orderGroup.id}
                  orderGroup={orderGroup}
                  onViewDetails={() => setSelectedOrderGroup(orderGroup)}
                  onCancel={() => handleCancelOrderGroup(orderGroup.group_uuid)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 주문 상세 모달 */}
      <OrderDetailModal
        orderGroup={selectedOrderGroup}
        onClose={() => setSelectedOrderGroup(null)}
        onCancel={handleCancelOrderGroup}
      />

    </div>
  );
};
