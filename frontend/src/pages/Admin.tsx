import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { fetchAllOrderGroups, getOrderGroupDownloadUrl, deleteOrderGroup, updateOrderGroupStatus, updatePricingSettings, type OrderGroupDetail, type PricingSettings } from '../utils/api';
import { formatPrice, getPricingSettings, invalidatePricingCache } from '../utils/pricing';
import { ProductionCalendar } from '../components/ProductionCalendar';
import { getStatusText, getStatusColor } from '../utils/orderHelpers';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';

const ADMIN_EMAILS = ['lsh678902@gmail.com'];

export function Admin() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [orderGroups, setOrderGroups] = useState<OrderGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderGroups, setSelectedOrderGroups] = useState<Set<string>>(new Set());
  const [selectedOrderGroupDetail, setSelectedOrderGroupDetail] = useState<OrderGroupDetail | null>(null);

  // 가격 설정 상태
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const [editingPricing, setEditingPricing] = useState(false);
  const [newPricing, setNewPricing] = useState<PricingSettings>({
    base_price: 20000,
    text_price: 5000,
    image_price: 5000,
  });

  const isAdmin = user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const loadOrderGroups = async () => {
    try {
      const token = await getToken();
      const data = await fetchAllOrderGroups(token);
      setOrderGroups(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load order groups:', err);
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

    loadOrderGroups();
    loadPricingSettings();
  }, [isLoaded, isAdmin]);

  // 가격 설정 저장
  const handleSavePricing = async () => {
    try {
      const token = await getToken();
      const updated = await updatePricingSettings(newPricing, token);
      setPricingSettings(updated);
      invalidatePricingCache();
      setEditingPricing(false);
      alert('가격 설정이 저장되었습니다.');
    } catch (err: any) {
      alert('가격 설정 저장 실패: ' + err.message);
    }
  };

  const handleDeleteOrderGroup = async (groupUuid: string) => {
    if (!confirm('정말로 이 주문을 삭제하시겠습니까?\nOBJ 파일과 모든 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      const token = await getToken();
      await deleteOrderGroup(groupUuid, token);
      alert('주문이 삭제되었습니다.');
      await loadOrderGroups();
    } catch (err: any) {
      alert('주문 삭제 실패: ' + err.message);
    }
  };

  const handleConfirmPayment = async (groupUuid: string) => {
    if (!confirm('입금을 확인했습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'paid', token);
      alert('입금 확인되었습니다.');
      await loadOrderGroups();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleStartProduction = async (groupUuid: string) => {
    if (!confirm('제작을 시작하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'in_production', token);
      alert('제작 시작으로 표시되었습니다.');
      await loadOrderGroups();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  const handleCompleteProduction = async (groupUuid: string) => {
    if (!confirm('제작을 완료하시겠습니까?')) {
      return;
    }

    try {
      const token = await getToken();
      await updateOrderGroupStatus(groupUuid, 'production_completed', token);
      alert('제작 완료로 표시되었습니다.');
      await loadOrderGroups();
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
      await loadOrderGroups();
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
      await loadOrderGroups();
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
      await loadOrderGroups();
    } catch (err: any) {
      alert('상태 업데이트 실패: ' + err.message);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedOrderGroups.size === orderGroups.length) {
      setSelectedOrderGroups(new Set());
    } else {
      setSelectedOrderGroups(new Set(orderGroups.map(og => og.group_uuid)));
    }
  };

  // 개별 선택/해제
  const handleSelectOrderGroup = (groupUuid: string) => {
    const newSelected = new Set(selectedOrderGroups);
    if (newSelected.has(groupUuid)) {
      newSelected.delete(groupUuid);
    } else {
      newSelected.add(groupUuid);
    }
    setSelectedOrderGroups(newSelected);
  };

  // 선택한 항목 일괄 삭제
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
      await loadOrderGroups();
    } catch (err: any) {
      alert('일괄 삭제 실패: ' + err.message);
    }
  };

  // 클립보드 복사 함수
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} 복사 완료`);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('복사 실패');
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
    <div style={{ padding: '40px' }}>
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

      {/* 생산 일정 관리 섹션 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '2px solid #2196F3' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>📅 생산 일정 관리</h2>
        <ProductionCalendar onReload={loadOrderGroups} />
      </div>

      {/* 주문 관리 섹션 */}
      <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>📦 주문 목록</h2>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          총 주문 수: <strong>{orderGroups.length}</strong>개 | 선택된 주문: <strong>{selectedOrderGroups.size}</strong>개
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
            {selectedOrderGroups.size === orderGroups.length ? '전체 해제' : '전체 선택'}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedOrderGroups.size === 0}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: selectedOrderGroups.size === 0 ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedOrderGroups.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🗑️ 선택 삭제 ({selectedOrderGroups.size})
          </button>
        </div>
      </div>

      {orderGroups.length === 0 ? (
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
              {orderGroups.map((orderGroup) => {
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
                    <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold', color: '#007bff' }}>
                      {formatPrice(orderGroup.total_price)}
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
                        📥 다운로드
                      </a>
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedOrderGroupDetail(orderGroup)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          📋 상세보기
                        </button>
                        {/* 입금 대기 → 입금 확인 */}
                        {orderGroup.status === 'pending' && (
                          <button
                            onClick={() => handleConfirmPayment(orderGroup.group_uuid)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            💰 입금 확인
                          </button>
                        )}
                        {/* 입금 완료 → 제작 시작 */}
                        {orderGroup.status === 'paid' && (
                          <button
                            onClick={() => handleStartProduction(orderGroup.group_uuid)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#fd7e14',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🔨 제작 시작
                          </button>
                        )}
                        {/* 제작 중 → 제작 완료 */}
                        {orderGroup.status === 'in_production' && (
                          <button
                            onClick={() => handleCompleteProduction(orderGroup.group_uuid)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#6610f2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ✅ 제작 완료
                          </button>
                        )}
                        {/* 제작 완료 → 배송 시작 */}
                        {orderGroup.status === 'production_completed' && (
                          <button
                            onClick={() => handleStartShipping(orderGroup.group_uuid)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🚚 배송 시작
                          </button>
                        )}
                        {/* 배송 중 → 배송 완료 */}
                        {orderGroup.status === 'shipped' && (
                          <button
                            onClick={() => handleCompleteOrder(orderGroup.group_uuid)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            📦 배송 완료
                          </button>
                        )}
                        {/* 취소 버튼 (완료/취소 상태가 아닐 때만) */}
                        {orderGroup.status !== 'completed' && orderGroup.status !== 'failed' && (
                          <button
                            onClick={() => handleCancelOrder(orderGroup.group_uuid)}
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
                          onClick={() => handleDeleteOrderGroup(orderGroup.group_uuid)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 주문 상세 모달 */}
      {selectedOrderGroupDetail && (
        <div
          style={MODAL_OVERLAY}
          onClick={() => setSelectedOrderGroupDetail(null)}
        >
          <div
            style={MODAL_CONTENT_LARGE}
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
                      {selectedOrderGroupDetail.group_uuid}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주문일시</td>
                    <td style={{ padding: '8px 0' }}>
                      {selectedOrderGroupDetail.created_at
                        ? new Date(selectedOrderGroupDetail.created_at).toLocaleString('ko-KR')
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
                          backgroundColor: getStatusColor(selectedOrderGroupDetail.status),
                          color: 'white',
                        }}
                      >
                        {getStatusText(selectedOrderGroupDetail.status)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>총 금액</td>
                    <td style={{ padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                      {formatPrice(selectedOrderGroupDetail.total_price)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', margin: 0, color: '#6c757d' }}>배송 정보</h3>
                <button
                  onClick={() => {
                    const fullAddress = `[${selectedOrderGroupDetail.customer_postal_code}] ${selectedOrderGroupDetail.customer_address}`;
                    copyToClipboard(fullAddress, '전체 주소');
                  }}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📋 전체 주소 복사
                </button>
              </div>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold', width: '120px' }}>이름</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroupDetail.customer_name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>이메일</td>
                    <td style={{ padding: '8px 0' }}>{selectedOrderGroupDetail.customer_email || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>전화번호</td>
                    <td style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{selectedOrderGroupDetail.customer_phone || '-'}</span>
                      {selectedOrderGroupDetail.customer_phone && (
                        <button
                          onClick={() => copyToClipboard(selectedOrderGroupDetail.customer_phone, '전화번호')}
                          style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          복사
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>우편번호</td>
                    <td style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{selectedOrderGroupDetail.customer_postal_code || '-'}</span>
                      {selectedOrderGroupDetail.customer_postal_code && (
                        <button
                          onClick={() => copyToClipboard(selectedOrderGroupDetail.customer_postal_code, '우편번호')}
                          style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          복사
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>주소</td>
                    <td style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ flex: 1 }}>{selectedOrderGroupDetail.customer_address || '-'}</span>
                        {selectedOrderGroupDetail.customer_address && (
                          <button
                            onClick={() => copyToClipboard(selectedOrderGroupDetail.customer_address, '주소')}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            복사
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {selectedOrderGroupDetail.delivery_message && (
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>배송 메시지</td>
                      <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedOrderGroupDetail.delivery_message}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#6c757d' }}>주문 제품 ({selectedOrderGroupDetail.line_items.length}개)</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                {selectedOrderGroupDetail.line_items.map((item, index) => {
                  // 파일명 생성 (백엔드와 동일한 로직)
                  const orderTime = selectedOrderGroupDetail.created_at
                    ? new Date(selectedOrderGroupDetail.created_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }).replace(/\. /g, '-').replace(/\./g, '').replace(/ /g, '_').replace(/:/g, '-')
                    : 'unknown';

                  const customerName = selectedOrderGroupDetail.customer_name.replace(/ /g, '_');
                  const baseFilename = `${customerName}_제품${index + 1}(x${item.quantity})_${orderTime}`;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '15px',
                        borderBottom: index < selectedOrderGroupDetail.line_items.length - 1 ? '1px solid #dee2e6' : 'none',
                        backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>제품 #{index + 1}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>
                          {formatPrice(item.total_price)}
                        </span>
                      </div>

                      {/* 파일명 정보 */}
                      <div style={{
                        marginBottom: '10px',
                        padding: '8px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                        border: '1px solid #90caf9'
                      }}>
                        <div style={{ fontSize: '11px', color: '#1976d2', fontWeight: 'bold', marginBottom: '4px' }}>
                          📁 파일명
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <code style={{
                            fontSize: '11px',
                            backgroundColor: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {baseFilename}.obj
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${baseFilename}.obj`, 'OBJ 파일명')}
                            style={{
                              padding: '2px 6px',
                              fontSize: '10px',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            복사
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{
                            fontSize: '11px',
                            backgroundColor: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {baseFilename}.mtl
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${baseFilename}.mtl`, 'MTL 파일명')}
                            style={{
                              padding: '2px 6px',
                              fontSize: '10px',
                              backgroundColor: '#1976d2',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          >
                            복사
                          </button>
                        </div>
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
                          <tr>
                            <td style={{ padding: '4px 0', color: '#666' }}>Line Item ID</td>
                            <td style={{ padding: '4px 0' }}>
                              <code style={{ fontSize: '11px', color: '#666' }}>{item.line_item_uuid.substring(0, 8)}...</code>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedOrderGroupDetail(null)}
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
