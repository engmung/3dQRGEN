import { useState, useEffect } from 'react';
import { fetchAvailableDates, type ProductionScheduleDate } from '../utils/api';

interface CustomerCalendarProps {
  totalQuantity: number; // 주문하려는 총 제품 개수 (표시용)
  readOnly?: boolean; // 읽기 전용 모드 (선택 불가)
}

interface DateAllocation {
  date: string;
  allocated: number;
  remainingAfterAllocation: number;
}

interface ScheduleViewItem {
  date: string;
  reserved: number;
  capacity: number;
  percentage: number;
  isMyOrder: boolean;
}

export function CustomerCalendar({ totalQuantity, readOnly = true }: CustomerCalendarProps) {
  const [schedules, setSchedules] = useState<ProductionScheduleDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableDates();
      setSchedules(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load available dates:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // 가능한 날짜만 필터링 (오늘 이후 + is_available=true)
  const getAvailableDates = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedules
      .filter(s => s.is_available && s.date >= today)
      .slice(0, 10); // 최대 10개만 표시
  };

  // 주문 수량을 날짜별로 분배 계산
  const calculateDistribution = (): { distribution: DateAllocation[]; hasEnoughCapacity: boolean } => {
    const availableDates = getAvailableDates();
    const distribution: DateAllocation[] = [];

    let remainingQuantity = totalQuantity;

    for (const schedule of availableDates) {
      if (remainingQuantity <= 0) break;

      const canAllocate = Math.min(remainingQuantity, schedule.available_slots);

      distribution.push({
        date: schedule.date,
        allocated: canAllocate,
        remainingAfterAllocation: schedule.available_slots - canAllocate,
      });

      remainingQuantity -= canAllocate;
    }

    return { distribution, hasEnoughCapacity: remainingQuantity <= 0 };
  };

  // 전체 현황 표시용 데이터
  const getFullScheduleView = (myOrderDates: string[]): ScheduleViewItem[] => {
    const availableDates = getAvailableDates();

    return availableDates.map(schedule => ({
      date: schedule.date,
      reserved: schedule.reserved_quantity,
      capacity: schedule.max_capacity,
      percentage: (schedule.reserved_quantity / schedule.max_capacity) * 100,
      isMyOrder: myOrderDates.includes(schedule.date),
    }));
  };

  // 날짜 포맷팅 - 긴 형식: "10월 28일 (화)"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  // 날짜 포맷팅 - 짧은 형식: "10/28 (화)"
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>날짜 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff5f5', color: '#c62828', borderRadius: '8px', border: '1px solid #e5e0db' }}>
        <strong>⚠️ 날짜 로드 실패</strong>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
      </div>
    );
  }

  const { distribution, hasEnoughCapacity } = calculateDistribution();
  const myOrderDates = distribution.map(d => d.date);
  const fullSchedule = getFullScheduleView(myOrderDates);

  return (
    <div style={{
      backgroundColor: '#f8f6f3',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e5e0db',
    }}>
      {/* 상단: 전체 생산 현황 */}
      <div style={{
        backgroundColor: '#faf9f7',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e0db',
        marginBottom: '20px',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
          📊 전체 생산 현황
        </h3>

        {fullSchedule.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #e5e0db'
          }}>
            현재 예약 가능한 날짜가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {fullSchedule.map((schedule) => {
              const percentage = schedule.percentage;

              let badge = '';
              let barColor = '#4CAF50';  // 기본: 초록

              if (percentage >= 100) {
                badge = '🔥 마감';
                barColor = '#ef5350';
              } else if (percentage >= 80) {
                badge = '⚡ 마감임박';
                barColor = '#ffc107';
              } else if (percentage < 50) {
                badge = '✨ 여유';
              }

              return (
                <div
                  key={schedule.date}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: schedule.isMyOrder ? '#fffbf0' : '#fff',
                    border: schedule.isMyOrder ? '1px solid #ffd700' : '1px solid #e5e0db',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{
                    minWidth: '90px',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#333',
                  }}>
                    {formatDateShort(schedule.date)}
                  </span>

                  {/* 프로그레스 바 */}
                  <div style={{
                    width: '120px',
                    height: '16px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: barColor,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {schedule.reserved}/{schedule.capacity} 예약
                  </span>

                  {badge && (
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단: 회원님 주문 배정 */}
      <div style={{
        backgroundColor: '#f0f8ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #b3d9ff',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
          📦 회원님 주문 배정
        </h3>

        {distribution.length === 0 ? (
          <div style={{ padding: '12px', color: '#999', textAlign: 'center' }}>
            배정 가능한 날짜가 없습니다.
          </div>
        ) : (
          <>
            {distribution.map((item) => (
              <div
                key={item.date}
                style={{
                  padding: '8px 0',
                  fontSize: '15px',
                  color: '#333',
                  fontWeight: 600,
                }}
              >
                🔜 {formatDate(item.date)} ─── <strong style={{ color: '#FF6B6B' }}>{item.allocated}개</strong> 생산 예정
              </div>
            ))}

            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #d0e8ff',
              lineHeight: '1.6',
            }}>
              💡 모든 제품 완성 후 한 번에 배송
            </div>
          </>
        )}

        {!hasEnoughCapacity && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fff5f5',
            border: '1px solid #ef5350',
            borderRadius: '6px',
            color: '#c62828',
            marginTop: '12px',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            ⚠️ 주문 수량({totalQuantity}개)이 현재 가능한 용량을 초과합니다. 관리자에게 문의해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
