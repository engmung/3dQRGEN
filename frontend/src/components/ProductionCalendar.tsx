import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchAllProductionSchedule, updateProductionDate, createProductionDate, fetchDateOrders, type ProductionScheduleDate } from '../utils/api';
import { MODAL_OVERLAY, MODAL_CONTENT } from '../styles/modalStyles';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../styles/buttonStyles';

interface ProductionCalendarProps {
  onReload?: () => void;
}

export function ProductionCalendar({ onReload }: ProductionCalendarProps) {
  const { getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ProductionScheduleDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<ProductionScheduleDate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ max_capacity: 5, is_available: true });
  const [dateOrders, setDateOrders] = useState<any>(null);

  // 캘린더 데이터 로드
  const loadSchedules = async () => {
    try {
      const token = await getToken();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Timezone-safe date formatting
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

      if (import.meta.env.DEV) {
        console.log(`📅 [ProductionCalendar] Loading schedules: ${startDate} ~ ${endDate}`);
      }
      const data = await fetchAllProductionSchedule(token, startDate, endDate);
      if (import.meta.env.DEV) {
        console.log(`📅 [ProductionCalendar] Loaded ${data.length} schedules:`, data.map(d => `${d.date}(${d.is_available})`));
      }
      setSchedules(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load schedules:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [currentDate]);

  // 이전/다음 달로 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 날짜 클릭 핸들러
  const handleDateClick = async (dateStr: string) => {
    const schedule = schedules.find(s => s.date === dateStr);

    if (schedule) {
      setSelectedDate(schedule);
      setEditData({
        max_capacity: schedule.max_capacity,
        is_available: schedule.is_available
      });

      // 해당 날짜의 주문 목록 로드
      try {
        const token = await getToken();
        const orders = await fetchDateOrders(dateStr, token);
        setDateOrders(orders);
      } catch (err) {
        console.error('Failed to load date orders:', err);
        setDateOrders(null);
      }
    } else {
      // 새로운 날짜 생성
      setSelectedDate({
        id: 0,
        date: dateStr,
        max_capacity: 5,
        reserved_quantity: 0,
        is_available: true,
        available_slots: 5
      });
      setEditData({ max_capacity: 5, is_available: true });
      setDateOrders(null);
    }

    setShowModal(true);
  };

  // 일정 저장
  const handleSave = async () => {
    if (!selectedDate) return;

    try {
      const token = await getToken();

      // 먼저 해당 날짜가 DB에 존재하는지 확인
      const allSchedules = await fetchAllProductionSchedule(
        token,
        selectedDate.date,
        selectedDate.date
      );
      const existingSchedule = allSchedules.find(s => s.date === selectedDate.date);

      // 존재 여부에 따라 POST/PATCH 결정
      if (existingSchedule) {
        // 수정
        await updateProductionDate(selectedDate.date, editData, token);
      } else {
        // 새로 생성
        await createProductionDate({
          date: selectedDate.date,
          max_capacity: editData.max_capacity,
          is_available: editData.is_available
        }, token);
      }

      alert('저장되었습니다.');
      setShowModal(false);
      loadSchedules();
      if (onReload) onReload();
    } catch (err: any) {
      alert('저장 실패: ' + err.message);
    }
  };

  // 캘린더 렌더링
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = [];
    let days = [];

    // 빈 칸 채우기 (이전 달)
    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-${i}`} style={{ padding: '8px', border: '1px solid #ddd' }}></td>);
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const schedule = schedules.find(s => s.date === dateStr);
      const today = new Date().toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isPast = dateStr < today;

      let bgColor = '#fff';
      let textColor = '#333';

      if (schedule) {
        if (!schedule.is_available) {
          bgColor = '#9e9e9e'; // 회색 (주문 불가)
          textColor = '#fff';
        } else {
          const ratio = schedule.reserved_quantity / schedule.max_capacity;
          if (ratio >= 0.8) {
            bgColor = '#ef5350'; // 빨강 (거의 마감)
            textColor = '#fff';
          } else if (ratio >= 0.5) {
            bgColor = '#ffeb3b'; // 노랑 (보통)
          } else {
            bgColor = '#66bb6a'; // 초록 (여유)
            textColor = '#fff';
          }
        }
      } else if (isPast) {
        bgColor = '#f5f5f5';
        textColor = '#999';
      }

      days.push(
        <td
          key={day}
          onClick={() => !isPast && handleDateClick(dateStr)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            backgroundColor: bgColor,
            color: textColor,
            cursor: isPast ? 'not-allowed' : 'pointer',
            textAlign: 'center',
            verticalAlign: 'top',
            minWidth: '80px',
            minHeight: '60px',
            position: 'relative',
            borderLeft: isToday ? '3px solid #2196F3' : undefined,
            fontWeight: isToday ? 'bold' : 'normal'
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '4px' }}>{day}</div>
          {schedule && (
            <div style={{ fontSize: '11px' }}>
              {schedule.reserved_quantity}/{schedule.max_capacity}
            </div>
          )}
        </td>
      );

      if ((firstDay + day) % 7 === 0) {
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
        days = [];
      }
    }

    // 마지막 주 처리
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<td key={`empty-end-${days.length}`} style={{ padding: '8px', border: '1px solid #ddd' }}></td>);
      }
      weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    }

    return weeks;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>;
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={goToPrevMonth}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← 이전 달
        </button>
        <h3 style={{ margin: 0, fontSize: '18px' }}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h3>
        <button
          onClick={goToNextMonth}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          다음 달 →
        </button>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#66bb6a', border: '1px solid #ccc' }}></div>
          <span>여유 있음 (&lt;50%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#ffeb3b', border: '1px solid #ccc' }}></div>
          <span>보통 (50~80%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#ef5350', border: '1px solid #ccc' }}></div>
          <span>거의 마감 (80%+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#9e9e9e', border: '1px solid #ccc' }}></div>
          <span>주문 불가</span>
        </div>
      </div>

      {/* 캘린더 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <th key={day} style={{
                padding: '10px',
                border: '1px solid #ddd',
                backgroundColor: '#f5f5f5',
                color: i === 0 ? '#f44336' : i === 6 ? '#2196F3' : '#333'
              }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      {/* 설정 모달 */}
      {showModal && selectedDate && (
        <div
          style={{
            ...MODAL_OVERLAY,
            zIndex: 2000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...MODAL_CONTENT,
              maxWidth: '600px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>생산 일정 설정 - {selectedDate.date}</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                최대 생산량
              </label>
              <input
                type="number"
                value={editData.max_capacity}
                onChange={(e) => setEditData({ ...editData, max_capacity: parseInt(e.target.value) || 0 })}
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                현재 예약: {selectedDate.reserved_quantity}개
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editData.is_available}
                  onChange={(e) => setEditData({ ...editData, is_available: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 'bold' }}>주문 가능</span>
              </label>
            </div>

            {/* 주문 목록 */}
            {dateOrders && dateOrders.orders.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>
                  이 날짜의 주문 ({dateOrders.total_orders}건, 총 {dateOrders.total_quantity}개)
                </h4>
                {dateOrders.orders.map((order: any, orderIndex: number) => {
                  // LineItem 단위로 정리
                  const lineItems: {
                    index: number;
                    name: string;
                    type: string;
                    totalQty: number;
                    dates: { [date: string]: number };
                  }[] = [];

                  let lineItemCounter = 1;
                  order.line_items?.forEach((item: any) => {
                    // QR 타입 추출 (SKU에서)
                    let qrType = 'BASE';
                    if (item.product_sku?.includes('IMAGE')) qrType = 'IMAGE';
                    else if (item.product_sku?.includes('TEXT')) qrType = 'TEXT';

                    lineItems.push({
                      index: lineItemCounter++,
                      name: `${order.customer_name}_${lineItemCounter}`,
                      type: qrType,
                      totalQty: item.quantity || 0,
                      dates: item.production_dates || { [selectedDate?.date || '']: item.quantity || 0 }
                    });
                  });

                  // 총 제품 개수 계산
                  const totalProducts = lineItems.reduce((sum, item) => sum + item.totalQty, 0);

                  // 날짜 개수 계산 (전체 주문 기준)
                  const allDates = new Set<string>();
                  lineItems.forEach(item => {
                    Object.keys(item.dates).forEach(date => allDates.add(date));
                  });
                  const dateCount = allDates.size;

                  // 오늘 제작 대상 (LineItem별 개수)
                  const todayItems = lineItems
                    .map(item => ({
                      index: item.index,
                      qty: item.dates[selectedDate?.date || ''] || 0
                    }))
                    .filter(item => item.qty > 0);

                  // 날짜 포맷팅 (YYYY-MM-DD → MM/DD)
                  const formatShortDate = (dateStr: string) => {
                    const [, month, day] = dateStr.split('-');
                    return `${month}/${day}`;
                  };

                  return (
                    <div key={orderIndex} style={{
                      padding: '16px',
                      marginBottom: '12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      fontSize: '13px',
                      border: '2px solid #333',
                      position: 'relative'
                    }}>
                      {/* 구분선 상단 */}
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '10px',
                        right: '10px',
                        height: '2px',
                        background: 'repeating-linear-gradient(90deg, #333 0, #333 8px, transparent 8px, transparent 16px)'
                      }} />

                      {/* 고객 정보 */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                          👤 {order.customer_name} ({order.customer_phone})
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                          📍 {order.customer_address}
                        </div>
                        {order.customer_memo && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            📝 {order.customer_memo}
                          </div>
                        )}
                      </div>

                      {/* 주문 구성 */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                          📦 주문 구성 (총 {lineItems.length}종류, {totalProducts}개{dateCount > 1 ? ` → ${dateCount}일 분할` : ''})
                        </div>
                        <div style={{
                          border: '1px solid #333',
                          borderRadius: '4px',
                          padding: '8px',
                          backgroundColor: '#fafafa'
                        }}>
                          {lineItems.map((item, idx) => (
                            <div key={idx} style={{
                              fontSize: '11px',
                              padding: '6px 8px',
                              borderBottom: idx < lineItems.length - 1 ? '1px solid #e0e0e0' : 'none',
                              backgroundColor: '#fff'
                            }}>
                              {/* 제품명과 총 개수 */}
                              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontFamily: 'monospace' }}>
                                #{item.index} {order.customer_name}_{item.index} ({item.type}) - {item.totalQty}개
                              </div>

                              {/* 날짜별 분할 정보 (2개 이상 날짜일 때만) */}
                              {Object.keys(item.dates).length > 1 ? (
                                <div style={{ paddingLeft: '12px', fontSize: '10px', color: '#555' }}>
                                  {Object.entries(item.dates)
                                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                                    .map(([date, qty], dateIdx) => (
                                      <div key={dateIdx} style={{ marginBottom: '2px' }}>
                                        {dateIdx === 0 ? '├' : dateIdx === Object.keys(item.dates).length - 1 ? '└' : '├'} {formatShortDate(date)}: {qty}개 {date === selectedDate?.date ? '✓' : ''}
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <div style={{ paddingLeft: '12px', fontSize: '10px', color: '#555' }}>
                                  └ {formatShortDate(Object.keys(item.dates)[0])}: {item.totalQty}개 ✓
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 오늘 제작 대상 */}
                      {todayItems.length > 0 && (
                        <div style={{
                          fontSize: '12px',
                          marginBottom: '10px',
                          padding: '8px 12px',
                          backgroundColor: '#fff3cd',
                          border: '1px solid #ffc107',
                          borderRadius: '4px',
                          fontWeight: 'bold'
                        }}>
                          <div style={{ marginBottom: '4px' }}>🎯 금일({formatShortDate(selectedDate?.date || '')}) 제작</div>
                          {todayItems.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '11px', paddingLeft: '12px' }}>
                              • #{item.index}: {item.qty}개
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 하단 정보 */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/api/order-groups/${order.group_uuid}/download`}
                            download
                            style={{
                              color: '#2196F3',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            📥 전체 ZIP
                          </a>
                          <span style={{
                            color: order.status === 'pending' ? '#ff9800' : '#4caf50',
                            fontWeight: 'bold'
                          }}>
                            상태: {order.status}
                          </span>
                        </div>
                        <div style={{ color: '#999', fontSize: '10px' }}>
                          UUID: {order.group_uuid.substring(0, 8)}...
                        </div>
                      </div>

                      {/* 구분선 하단 */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '10px',
                        right: '10px',
                        height: '2px',
                        background: 'repeating-linear-gradient(90deg, #333 0, #333 8px, transparent 8px, transparent 16px)'
                      }} />
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={BUTTON_SECONDARY}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                style={BUTTON_PRIMARY}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
