import { useDesignStore } from '../store/useDesignStore';

interface RightPanelProps {
  onCheckout: () => void;
}

export function RightPanel({ onCheckout }: RightPanelProps) {
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);
  const addPlate = useDesignStore((state) => state.addPlate);

  const cardStyle = (isSelected: boolean) => ({
    width: '100%',
    aspectRatio: '1',
    backgroundColor: isSelected ? '#fff' : '#f5f5f5',
    border: isSelected ? '3px solid #4A90E2' : '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s',
    boxShadow: isSelected ? '0 4px 12px rgba(74, 144, 226, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  });

  const addButtonStyle = {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#fafafa',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#999',
    transition: 'all 0.2s',
  };

  // 썸네일 생성 (임시: 색상 조합으로 표시)
  const renderThumbnail = (plate: typeof plates[0]) => {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}>
        <div style={{
          flex: 1,
          backgroundColor: plate.plateColor,
        }} />
        <div style={{
          flex: 1,
          backgroundColor: plate.qrColor,
        }} />
      </div>
    );
  };

  return (
    <div style={{
      width: '15%',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#fff',
      borderLeft: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 상단: 타이틀 */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold',
        fontSize: '16px',
        backgroundColor: '#fafafa'
      }}>
        QR 판 목록
      </div>

      {/* 중앙: 카드 리스트 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {plates.map((plate) => (
          <div
            key={plate.id}
            style={cardStyle(plate.id === selectedPlateId)}
            onClick={() => selectPlate(plate.id)}
            onMouseOver={(e) => {
              if (plate.id !== selectedPlateId) {
                e.currentTarget.style.borderColor = '#4A90E2';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (plate.id !== selectedPlateId) {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {renderThumbnail(plate)}

            {/* 선택 표시 */}
            {plate.id === selectedPlateId && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#4A90E2',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}

        {/* + 버튼 (새 Plate 추가) */}
        <div
          style={addButtonStyle}
          onClick={() => {
            const newPlate = addPlate();
            selectPlate(newPlate.id);
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#4A90E2';
            e.currentTarget.style.color = '#4A90E2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.color = '#999';
          }}
        >
          <div>+</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>새 QR 판</div>
        </div>
      </div>

      {/* 하단: 주문하기 버튼 */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #ddd'
      }}>
        <button
          onClick={onCheckout}
          disabled={plates.length === 0}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: plates.length === 0 ? '#ccc' : '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: plates.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (plates.length > 0) {
              e.currentTarget.style.backgroundColor = '#FF5252';
            }
          }}
          onMouseOut={(e) => {
            if (plates.length > 0) {
              e.currentTarget.style.backgroundColor = '#FF6B6B';
            }
          }}
        >
          주문하기 ({plates.length})
        </button>
      </div>
    </div>
  );
}
