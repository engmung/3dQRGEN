import { useState, useEffect } from 'react';
import { fetchAvailableDates, fetchPricingSettings, type ProductionScheduleDate, type PricingSettings } from '../utils/api';
import { MODAL_OVERLAY } from '../styles/modalStyles';
import { useIsMobile } from '../hooks/useMediaQuery';

interface AvailabilityBannerProps {
  onClose?: () => void;
}

export const AvailabilityBanner = ({ onClose }: AvailabilityBannerProps) => {
  const isMobile = useIsMobile();
  const [totalSlots, setTotalSlots] = useState<number>(0);
  const [totalCapacity, setTotalCapacity] = useState<number>(0);
  const [soldCount, setSoldCount] = useState<number>(0);
  const [announcement, setAnnouncement] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);

      // 주문 가능 날짜 조회
      const dates: ProductionScheduleDate[] = await fetchAvailableDates();
      const available = dates.reduce((sum, date) => sum + date.available_slots, 0);
      const capacity = dates.reduce((sum, date) => sum + date.max_capacity, 0);
      const sold = capacity - available;

      setTotalSlots(available);
      setTotalCapacity(capacity);
      setSoldCount(sold);

      // 공지사항 조회
      const pricing: PricingSettings = await fetchPricingSettings();
      setAnnouncement(pricing.announcement_message || '');
    } catch (error) {
      console.error('Failed to load availability:', error);
      setTotalSlots(0);
      setTotalCapacity(0);
      setSoldCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // 로딩 중에는 표시 안 함
  }

  return (
    <div
      style={isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
      } : MODAL_OVERLAY}
      onClick={onClose}
    >
      <div
        style={isMobile ? {
          position: 'absolute',
          top: '50%',
          left: '75%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          width: '50%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        } : {
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: 'auto',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          marginTop: 0,
          marginBottom: isMobile ? '15px' : '20px',
          fontSize: isMobile ? '18px' : '20px',
          textAlign: 'center'
        }}>
          📢 주문 가능 정보
        </h2>

        {/* 주문 가능 수량 표시 */}
        <div style={{
          marginBottom: isMobile ? '15px' : '20px',
          padding: isMobile ? '15px' : '20px',
          backgroundColor: totalSlots > 10 ? '#e8f5e9' : totalSlots > 0 ? '#fff3e0' : '#ffebee',
          border: `2px solid ${totalSlots > 10 ? '#4CAF50' : totalSlots > 0 ? '#FF9800' : '#f44336'}`,
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: isMobile ? '28px' : '32px',
            fontWeight: 700,
            marginBottom: '10px',
            color: totalSlots > 10 ? '#2e7d32' : totalSlots > 0 ? '#e65100' : '#c62828'
          }}>
            {totalSlots}개 남음
          </div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', color: '#666' }}>
            ({soldCount}/{totalCapacity})
          </div>
        </div>

        {/* 공지사항 */}
        {announcement && (
          <div style={{
            marginBottom: isMobile ? '15px' : '20px',
            padding: isMobile ? '12px' : '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            color: '#333',
          }}>
            {announcement}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: isMobile ? '8px 24px' : '10px 30px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: 'bold',
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
