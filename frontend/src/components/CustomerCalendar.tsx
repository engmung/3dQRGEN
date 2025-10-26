import { useState, useEffect } from 'react';
import { fetchAvailableDates, type ProductionScheduleDate } from '../utils/api';

interface CustomerCalendarProps {
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  totalQuantity: number; // 주문하려는 총 제품 개수
}

export function CustomerCalendar({ selectedDate, onDateChange, totalQuantity }: CustomerCalendarProps) {
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

      // 자동 선택: 용량이 충분한 첫 번째 날짜 선택
      if (!selectedDate) {
        const suitable = data.find(d => d.available_slots >= totalQuantity);
        if (suitable) {
          onDateChange(suitable.date);
        }
      }
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

  // 날짜 클릭 핸들러
  const handleDateClick = (dateStr: string) => {
    const schedule = schedules.find(s => s.date === dateStr);

    // 클릭 가능 여부 확인
    if (!schedule) return; // 데이터 없음
    if (!schedule.is_available) return; // 주문 불가
    if (schedule.available_slots < totalQuantity) return; // 용량 부족

    onDateChange(dateStr);
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
      const isSelected = dateStr === selectedDate;

      let bgColor = '#fff';
      let textColor = '#333';
      let cursor = 'default';
      let clickable = false;

      if (schedule) {
        if (!schedule.is_available) {
          // 주문 불가
          bgColor = '#9e9e9e';
          textColor = '#fff';
          cursor = 'not-allowed';
        } else if (schedule.available_slots < totalQuantity) {
          // 용량 부족 (빨강, 클릭 불가)
          bgColor = '#ef5350';
          textColor = '#fff';
          cursor = 'not-allowed';
        } else {
          // 선택 가능
          clickable = true;
          cursor = 'pointer';
          const ratio = schedule.reserved_quantity / schedule.max_capacity;
          if (ratio >= 0.8) {
            bgColor = '#ffeb3b'; // 노랑 (거의 마감)
            textColor = '#333';
          } else if (ratio >= 0.5) {
            bgColor = '#fff9c4'; // 연한 노랑
            textColor = '#333';
          } else {
            bgColor = '#66bb6a'; // 초록 (여유)
            textColor = '#fff';
          }
        }
      } else if (isPast) {
        bgColor = '#f5f5f5';
        textColor = '#999';
        cursor = 'not-allowed';
      }

      // 선택된 날짜는 파란 테두리
      const border = isSelected ? '3px solid #2196F3' : '1px solid #e0e0e0';

      days.push(
        <td
          key={day}
          onClick={() => clickable && handleDateClick(dateStr)}
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
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (clickable) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }
          }}
          onMouseLeave={(e) => {
            if (clickable) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '4px' }}>
            {day}
            {isToday && <span style={{ fontSize: '10px', marginLeft: '2px' }}>📍</span>}
          </div>
          {schedule && (
            <div style={{ fontSize: '10px' }}>
              남은: {schedule.available_slots}개
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

  // 선택된 날짜 정보
  const selectedSchedule = schedules.find(s => s.date === selectedDate);

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: 'bold' }}>
          생산 희망일 선택 *
        </h3>
        <div style={{ fontSize: '13px', color: '#666' }}>
          총 주문 수량: <strong style={{ color: '#2196F3', fontSize: '15px' }}>{totalQuantity}개</strong>
        </div>
      </div>

      {/* 월 이동 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={goToPrevMonth}
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
          ← 이전 달
        </button>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h4>
        <button
          onClick={goToNextMonth}
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
          다음 달 →
        </button>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', fontSize: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#66bb6a', border: '1px solid #ccc' }}></div>
          <span>여유</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#ffeb3b', border: '1px solid #ccc' }}></div>
          <span>보통</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#ef5350', border: '1px solid #ccc' }}></div>
          <span>용량부족</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#9e9e9e', border: '1px solid #ccc' }}></div>
          <span>주문불가</span>
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

      {/* 선택된 날짜 정보 */}
      {selectedDate && selectedSchedule && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e3f5ff',
          borderRadius: '8px',
          border: '2px solid #2196F3',
        }}>
          <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
            <strong>✅ 선택한 날짜:</strong>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2196F3', marginBottom: '8px' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            이 날짜의 남은 생산 슬롯: <strong style={{ color: '#4CAF50' }}>{selectedSchedule.available_slots}개</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
            💡 생산 완료 후 배송이 시작됩니다. (생산 1-2일 소요)
          </div>
        </div>
      )}

      {/* 선택 가능한 날짜 없음 */}
      {schedules.length > 0 && !schedules.some(s => s.is_available && s.available_slots >= totalQuantity) && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          color: '#856404',
        }}>
          <strong>⚠️ 선택 가능한 날짜가 없습니다</strong>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>
            현재 주문 수량({totalQuantity}개)을 생산할 수 있는 날짜가 없습니다.<br />
            관리자에게 문의해주세요.
          </div>
        </div>
      )}
    </div>
  );
}
