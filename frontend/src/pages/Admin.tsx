import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { fetchOrders, getDownloadUrl, deleteOrder, updateOrderStatus, updatePricingSettings, type OrderListItem, type PricingSettings } from '../utils/api';
import { formatPrice, getPricingSettings, invalidatePricingCache } from '../utils/pricing';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Admin() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // 가격 설정 상태
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [newPricing, setNewPricing] = useState<PricingSettings>({
    base_price: 20000,
    text_price: 5000,
    image_price: 5000,
  });

  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const loadOrders = async () => {
    try {
      const token = await getToken();
      const data = await fetchOrders(token);
      setOrders(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // 가격 설정 로드
  const loadPricingSettings = async () => {
    try {
      const settings = await getPricingSettings();
      setPricingSettings(settings);
      setNewPricing(settings);
    } catch (err) {
      console.error('Failed to load pricing settings:', err);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    loadOrders();
    loadPricingSettings();
  }, [isLoaded, isAdmin]);

  // 가격 설정 저장
  const handleSavePricing = async () => {
    try {
      const token = await getToken();
      const updated = await updatePricingSettings(newPricing, token);
      setPricingSettings(updated);
      invalidatePricingCache(); // 캐시 무효화
      setEditingPricing(false);
      alert('가격 설정이 저장되었습니다.');
    } catch (err: any) {
      alert('가격 설정 저장 실패: ' + err.message);
    }
  };

  const handleDeleteOrder = async (orderUuid: string) => {
    if (!confirm('정말로 이 주문을 삭제하시겠습니까?\nOBJ 파일과 모든 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      const token = await getToken();
      await deleteOrder(orderUuid, token);
      alert('주문이 삭제되었습니다.');
      await loadOrders(); // 목록 새로고침
    } catch (err: any) {
      alert('주문 삭제 실패: ' + err.message);
    }
  };

  const handleConfirmPayment = async (orderUuid: string) => {
    if (!confirm('입금을 확인했습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderStatus(orderUuid, 'paid', token);
      alert('입금 확인되었습니다.');
      await loadOrders(); // 목록 새로고침
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleCompleteOrder = async (orderUuid: string) => {
    if (!confirm('이 주문을 제작 완료로 표시하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderStatus(orderUuid, 'completed', token);
      alert('주문이 제작 완료로 표시되었습니다.');
      await loadOrders(); // 목록 새로고침
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleCancelOrder = async (orderUuid: string) => {
    if (!confirm('이 주문을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderStatus(orderUuid, 'failed', token);
      alert('주문이 취소되었습니다.');
      await loadOrders(); // 목록 새로고침
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.order_uuid)));
    }
  };

  // 개별 선택/해제
  const handleSelectOrder = (orderUuid: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderUuid)) {
      newSelected.delete(orderUuid);
    } else {
      newSelected.add(orderUuid);
    }
    setSelectedOrders(newSelected);
  };

  // 선택한 항목 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      alert('삭제할 주문을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedOrders.size}개의 주문을 삭제하시겠습니까?\nOBJ 파일과 모든 데이터가 삭제됩니다.`)) {
      return;
    }

    try {
      const token = await getToken();
      let successCount = 0;
      let failCount = 0;

      for (const orderUuid of selectedOrders) {
        try {
          await deleteOrder(orderUuid, token);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete order ${orderUuid}:`, err);
          failCount++;
        }
      }

      alert(`${successCount}개 삭제 완료${failCount > 0 ? `, ${failCount}개 실패` : ''}`);
      setSelectedOrders(new Set());
      await loadOrders();
    } catch (err: any) {
      alert('일괄 삭제 실패: ' + err.message);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>로딩 중...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>접근 거부</h2>
        <p>관리자만 접근할 수 있습니다.</p>
        <a href="/" style={{ color: '#4CAF50', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
          ← 홈으로 돌아가기
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>오류 발생</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>관리자 페이지</h1>
        <a href="/" style={{ textDecoration: 'none', color: '#4CAF50', fontSize: '16px' }}>← 홈으로</a>
      </div>

      {/* 가격 설정 섹션 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '2px solid #4CAF50' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>💰 가격 설정</h2>
          {!editingPricing && (
            <button
              onClick={() => setEditingPricing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              수정
            </button>
          )}
        </div>

        {editingPricing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>기본 가격 (원)</label>
                <input
                  type="number"
                  value={newPricing.base_price}
                  onChange={(e) => setNewPricing({ ...newPricing, base_price: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>텍스트 추가 (원)</label>
                <input
                  type="number"
                  value={newPricing.text_price}
                  onChange={(e) => setNewPricing({ ...newPricing, text_price: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>이미지 추가 (원/개)</label>
                <input
                  type="number"
                  value={newPricing.image_price}
                  onChange={(e) => setNewPricing({ ...newPricing, image_price: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setEditingPricing(false);
                  setNewPricing(pricingSettings || { base_price: 20000, text_price: 5000, image_price: 5000 });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#999',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSavePricing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>기본 가격</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                {pricingSettings ? formatPrice(pricingSettings.base_price) : '로딩 중...'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>텍스트 추가</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                {pricingSettings ? formatPrice(pricingSettings.text_price) : '로딩 중...'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>이미지 추가 (개당)</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                {pricingSettings ? formatPrice(pricingSettings.image_price) : '로딩 중...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 주문 관리 섹션 */}
      <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>📦 주문 목록</h2>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          총 주문 수: <strong>{orders.length}</strong>개 | 선택된 주문: <strong>{selectedOrders.size}</strong>개
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSelectAll}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {selectedOrders.size === orders.length ? '전체 해제' : '전체 선택'}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedOrders.size === 0}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: selectedOrders.size === 0 ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedOrders.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ 선택 삭제 ({selectedOrders.size})
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#888' }}>아직 주문이 없습니다.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={headerStyle}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={headerStyle}>ID</th>
                <th style={headerStyle}>주문 번호</th>
                <th style={headerStyle}>거치대</th>
                <th style={headerStyle}>QR URL</th>
                <th style={headerStyle}>고객명</th>
                <th style={headerStyle}>전화번호</th>
                <th style={headerStyle}>우편번호</th>
                <th style={headerStyle}>주소</th>
                <th style={headerStyle}>금액</th>
                <th style={headerStyle}>상태</th>
                <th style={headerStyle}>주문일시</th>
                <th style={headerStyle}>OBJ</th>
                <th style={headerStyle}>작업</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    backgroundColor: selectedOrders.has(order.order_uuid) ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.order_uuid)}
                      onChange={() => handleSelectOrder(order.order_uuid)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={cellStyle}>{order.id}</td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                    {order.order_uuid.substring(0, 8)}...
                  </td>
                  <td style={cellStyle}>{order.stand_name}</td>
                  <td style={{ ...cellStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={order.qr_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50' }}>
                      {order.qr_url}
                    </a>
                  </td>
                  <td style={cellStyle}>{order.customer_name}</td>
                  <td style={cellStyle}>{order.customer_phone || '-'}</td>
                  <td style={cellStyle}>{order.customer_postal_code || '-'}</td>
                  <td style={{ ...cellStyle, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.customer_address || '-'}
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold', color: '#007bff' }}>
                    {order.price ? formatPrice(order.price) : '-'}
                  </td>
                  <td style={cellStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor:
                        order.status === 'completed' ? '#e3f2fd' :
                        order.status === 'paid' ? '#e7f5e7' :
                        '#f5f5f5',
                      color:
                        order.status === 'completed' ? '#1976d2' :
                        order.status === 'paid' ? '#4CAF50' :
                        '#888'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    {order.created_at ? new Date(order.created_at).toLocaleString('ko-KR') : '-'}
                  </td>
                  <td style={cellStyle}>
                    <a
                      href={getDownloadUrl(order.order_uuid)}
                      download
                      style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}
                    >
                      📥 다운로드
                    </a>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(order.order_uuid)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          💰 입금 확인
                        </button>
                      )}
                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleCompleteOrder(order.order_uuid)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ 제작 완료
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'paid') && (
                        <button
                          onClick={() => handleCancelOrder(order.order_uuid)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ 취소
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order.order_uuid)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
