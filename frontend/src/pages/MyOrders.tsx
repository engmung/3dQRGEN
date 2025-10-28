import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchMyOrderGroups, cancelOrderGroup, type OrderGroupDetail } from '../utils/api';
import { formatPrice } from '../utils/pricing';
import { getStatusText, getStatusColor } from '../utils/orderHelpers';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';
import { useIsMobile } from '../hooks/useMediaQuery';

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
          {orderGroups.map((orderGroup) => {
            const totalQuantity = orderGroup.line_items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={orderGroup.id}
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
                    onClick={() => setSelectedOrderGroup(orderGroup)}
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
                  {(orderGroup.status === 'pending' || orderGroup.status === 'paid') && (
                    <button
                      onClick={() => handleCancelOrderGroup(orderGroup.group_uuid)}
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
          })}
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
              {orderGroups.map((orderGroup) => {
                const totalQuantity = orderGroup.line_items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr
                    key={orderGroup.id}
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
                          onClick={() => setSelectedOrderGroup(orderGroup)}
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
                        {(orderGroup.status === 'pending' || orderGroup.status === 'paid') && (
                          <button
                            onClick={() => handleCancelOrderGroup(orderGroup.group_uuid)}
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
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 주문 상세 모달 */}
      {selectedOrderGroup && (
        <div
          style={MODAL_OVERLAY}
          onClick={() => setSelectedOrderGroup(null)}
        >
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

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 정보</h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>주문번호</td>
                    <td style={{ padding: '8px 0', fontFamily: 'monospace' }}>
                      {selectedOrderGroup.group_uuid}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주문일시</td>
                    <td style={{ padding: '8px 0' }}>
                      {selectedOrderGroup.created_at
                        ? new Date(selectedOrderGroup.created_at).toLocaleString('ko-KR')
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
                          backgroundColor: getStatusColor(selectedOrderGroup.status),
                          color: 'white',
                        }}
                      >
                        {getStatusText(selectedOrderGroup.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', verticalAlign: 'top' }}>금액 상세</td>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                          <span>제품 합계</span>
                          <span>{formatPrice(selectedOrderGroup.total_price - 5000)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                          <span>배송비</span>
                          <span>{formatPrice(5000)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#007bff', paddingTop: '4px', borderTop: '1px solid #eee' }}>
                          <span>총 금액</span>
                          <span>{formatPrice(selectedOrderGroup.total_price)}</span>
                        </div>
                      </div>
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
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroup.customer_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>전화번호</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroup.customer_phone || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>우편번호</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroup.customer_postal_code || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주소</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroup.customer_address || '-'}</td>
                  </tr>
                  {selectedOrderGroup.delivery_message && (
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>배송 메시지</td>
                      <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedOrderGroup.delivery_message}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 제품 ({selectedOrderGroup.line_items.length}개)</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                {selectedOrderGroup.line_items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '15px',
                      borderBottom: index < selectedOrderGroup.line_items.length - 1 ? '1px solid #dee2e6' : 'none',
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

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {selectedOrderGroup.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrderGroup(selectedOrderGroup.group_uuid)}
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
                onClick={() => setSelectedOrderGroup(null)}
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
