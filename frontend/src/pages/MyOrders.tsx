import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchMyOrders, cancelMyOrder, type OrderListItem } from '../utils/api';
import { formatPrice } from '../utils/pricing';

export const MyOrders = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await fetchMyOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('주문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderUuid: string) => {
    if (!confirm('정말로 이 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await cancelMyOrder(orderUuid, token);
      alert('주문이 취소되었습니다.');
      await loadOrders(); // 목록 새로고침
      setSelectedOrder(null); // 모달 닫기
    } catch (err: any) {
      alert(err.message || '주문 취소에 실패했습니다.');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '입금 대기',
      paid: '입금 완료',
      completed: '배송 완료',
      failed: '취소됨',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: '#ffc107',
      paid: '#28a745',
      completed: '#007bff',
      failed: '#dc3545',
    };
    return colorMap[status] || '#6c757d';
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
          onClick={loadOrders}
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px' }}>내 주문 내역</h1>

      {orders.length === 0 ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#6c757d' }}>주문 내역이 없습니다.</p>
        </div>
      ) : (
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
                <th style={{ padding: '15px', textAlign: 'left' }}>QR URL</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>거치대</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>금액</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>상태</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: '1px solid #dee2e6',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={{ padding: '15px', fontSize: '14px', fontFamily: 'monospace' }}>
                    {order.order_uuid.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px' }}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString('ko-KR')
                      : '-'}
                  </td>
                  <td
                    style={{
                      padding: '15px',
                      fontSize: '14px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {order.qr_url}
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px' }}>{order.stand_name}</td>
                  <td style={{ padding: '15px', fontSize: '14px', textAlign: 'right', fontWeight: 'bold' }}>
                    {order.price ? formatPrice(order.price) : '-'}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
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
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.order_uuid)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 주문 상세 모달 */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>주문 상세 정보</h2>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 정보</h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>주문번호</td>
                    <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>
                      {selectedOrder.order_uuid}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주문일시</td>
                    <td style={{ padding: '8px 0' }}>
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString('ko-KR')
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
                          backgroundColor: getStatusColor(selectedOrder.status),
                          color: 'white',
                        }}
                      >
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>금액</td>
                    <td style={{ padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                      {selectedOrder.price ? formatPrice(selectedOrder.price) : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>배송 정보</h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>이름</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrder.customer_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>전화번호</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrder.customer_phone || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>우편번호</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrder.customer_postal_code || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주소</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrder.customer_address || '-'}</td>
                  </tr>
                  {selectedOrder.delivery_message && (
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>배송 메시지</td>
                      <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedOrder.delivery_message}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>제품 정보</h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>QR URL</td>
                    <td style={{ padding: '8px 0', wordBreak: 'break-all' }}>
                      {selectedOrder.qr_url}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>거치대 종류</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrder.stand_name}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.order_uuid)}
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
                onClick={() => setSelectedOrder(null)}
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
      )}
    </div>
  );
};
