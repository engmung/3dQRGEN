/**
 * Right Panel - Main Layout
 * Shopping cart with plate cards and download button
 */
import { useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { COLORS } from '../../../constants/colors';
import { PlateCard } from './PlateCard';
import { TotalSummary } from './TotalSummary';

interface RightPanelProps {
  onDownload: () => void;
}

/**
 * Right sidebar showing all plates and download button
 */
export function RightPanel({ onDownload }: RightPanelProps) {
  const isMobile = useIsMobile();
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);
  const addPlate = useDesignStore((state) => state.addPlate);
  const removePlate = useDesignStore((state) => state.removePlate);
  const duplicatePlate = useDesignStore((state) => state.duplicatePlate);
  const [addButtonHover, setAddButtonHover] = useState(false);

  const addButtonStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '2 / 1',
    backgroundColor: addButtonHover ? '#f0f0f0' : '#fafafa',
    border: addButtonHover ? `2px dashed ${COLORS.SECONDARY}` : '2px dashed #ccc',
    borderRadius: '0',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    color: addButtonHover ? COLORS.SECONDARY : COLORS.UI.TEXT_DISABLED,
    transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        width: isMobile ? '100%' : '17%',
        height: isMobile ? 'auto' : 'calc(100vh - 50px)',
        backgroundColor: isMobile ? 'transparent' : '#fff',
        borderLeft: isMobile ? 'none' : `1px solid ${COLORS.UI.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'visible' : 'hidden',
      }}
    >
      {/* Header: Title */}
      {!isMobile && (
        <div
          style={{
            padding: '15px',
            borderBottom: `1px solid ${COLORS.UI.BORDER}`,
            fontWeight: 600,
            fontSize: '18px',
            backgroundColor: COLORS.UI.BACKGROUND,
          }}
        >
          Cart
        </div>
      )}

      {/* Main: Card list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '12px 20px' : '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {plates.map((plate) => (
          <PlateCard
            key={plate.id}
            plate={plate}
            isSelected={plate.id === selectedPlateId}
            isMobile={isMobile}
            onSelect={() => selectPlate(plate.id)}
            onDuplicate={() => {
              const duplicated = duplicatePlate(plate.id);
              if (duplicated) selectPlate(duplicated.id);
            }}
            onDelete={() => removePlate(plate.id)}
          />
        ))}

        {/* Add new plate button */}
        <div
          style={addButtonStyle}
          onClick={() => {
            const newPlate = addPlate();
            selectPlate(newPlate.id);
          }}
          onMouseEnter={() => setAddButtonHover(true)}
          onMouseLeave={() => setAddButtonHover(false)}
        >
          <div>+</div>
          <div style={{ fontSize: '14px', fontWeight: 400, marginTop: '4px' }}>New QR Plate</div>
        </div>
      </div>

      {/* Footer: Total summary and download */}
      <TotalSummary
        hasPlates={plates.length > 0}
        isMobile={isMobile}
        onDownload={onDownload}
      />
    </div>
  );
}
