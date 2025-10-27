import { useState, useEffect } from 'react';
import { fetchAvailableDates, type ProductionScheduleDate } from '../utils/api';
import { COLORS } from '../styles/colors';
import { SPACING } from '../styles/spacing';

interface CustomerCalendarProps {
  totalQuantity: number; // 주문하려는 총 제품 개수 (표시용)
  readOnly?: boolean; // 읽기 전용 모드 (선택 불가)
}

export function CustomerCalendar({ totalQuantity, readOnly = true }: CustomerCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ProductionScheduleDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, [currentDate]);

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

  // 이전/다음 달로 이동
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 읽기 전용 모드에서는 날짜 클릭 불가
  const handleDateClick = (dateStr: string) => {
    // 읽기 전용 모드 - 아무 동작 안 함
    return;
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
      days.push(<td key={`empty-${i}`} style={{ padding: '8px', border: '1px solid #e0e0e0' }}></td>);
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
      let cursor = 'default';
      let badge = '';  // 뱃지 텍스트

      if (schedule) {
        if (!schedule.is_available) {
          // 주문 불가
          bgColor = '#e0e0e0';
          textColor = '#999';
        } else if (schedule.available_slots === 0) {
          // 마감
          bgColor = '#ef5350';
          textColor = '#fff';
          badge = '🔥 마감';
        } else if (schedule.available_slots <= 2) {
          // 마감 임박
          bgColor = '#ffeb3b';
          textColor = '#333';
          badge = '⚡ 마감임박';
        } else {
          // 예약 가능
          bgColor = COLORS.success;
          textColor = COLORS.text.white;
        }
      } else if (isPast) {
        bgColor = '#f5f5f5';
        textColor = '#999';
      }

      const border = '1px solid #e0e0e0';

      days.push(
        <td
          key={day}
          style={{
            padding: '8px',
            border,
            backgroundColor: bgColor,
            color: textColor,
            cursor,
            textAlign: 'center',
            verticalAlign: 'top',
            minWidth: '80px',
            minHeight: '60px',
            position: 'relative',
            fontWeight: isToday ? 'bold' : 'normal',
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '4px' }}>
            {day}
            {isToday && <span style={{ fontSize: '10px', marginLeft: '2px' }}>📍</span>}
          </div>
          {badge && (
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              {badge}
            </div>
          )}
          {schedule && schedule.is_available && !badge && (
            <div style={{ fontSize: '10px' }}>
              {schedule.available_slots}자리
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
        days.push(<td key={`empty-end-${days.length}`} style={{ padding: '8px', border: '1px solid #e0e0e0' }}></td>);
      }
      weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
    }

    return weeks;
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
      <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', border: '1px solid #ef5350' }}>
        <strong>⚠️ 날짜 로드 실패</strong>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
          📅 현재 예약 현황
        </h3>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>
          주문 수량: <strong style={{ color: '#2196F3', fontSize: '15px' }}>{totalQuantity}개</strong>
        </div>
        <div style={{ fontSize: '12px', color: '#888', backgroundColor: '#f0f8ff', padding: '8px', borderRadius: '4px', border: '1px solid #d0e8ff' }}>
          💡 주문하시면 가능한 가장 빠른 날짜부터 자동으로 배정됩니다.
        </div>
      </div>

      {/* 월 이동 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            goToPrevMonth();
          }}
          type="button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ← 이전달
        </button>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h4>
        <button
          onClick={(e) => {
            e.preventDefault();
            goToNextMonth();
          }}
          type="button"
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          다음달 →
        </button>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.lg, fontSize: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.success, border: `1px solid ${COLORS.border.medium}` }}></div>
          <span>선택 가능</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#e0e0e0', border: `1px solid ${COLORS.border.medium}` }}></div>
          <span>선택 불가</span>
        </div>
      </div>

      {/* 캘린더 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
        <thead>
          <tr>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <th key={day} style={{
                padding: '10px 8px',
                border: '1px solid #e0e0e0',
                backgroundColor: '#f8f8f8',
                color: i === 0 ? '#f44336' : i === 6 ? '#2196F3' : '#333',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

    </div>
  );
}
