/**
 * Right Panel - Main Layout
 * Shopping cart with plate cards, totals, and checkout
 */
import { useEffect, useState } from 'react';
import { useDesignStore } from '../../../store/useDesignStore';
import { getPricingSettings, calculatePlatePrice } from '../../../utils/pricing';
import type { PricingSettings } from '../../../utils/api';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { COLORS } from '../../../constants/colors';
import { PRICING } from '../../../constants/pricing';
import { PlateCard } from './PlateCard';
import { TotalSummary } from './TotalSummary';

interface RightPanelProps {
  onCheckout: () => void;
}

/**
 * Right sidebar showing all plates and checkout
 */
export function RightPanel({ onCheckout }: RightPanelProps) {
  const isMobile = useIsMobile();
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);
  const addPlate = useDesignStore((state) => state.addPlate);
  const removePlate = useDesignStore((state) => state.removePlate);
  const duplicatePlate = useDesignStore((state) => state.duplicatePlate);
  const updatePlateQuantity = useDesignStore((state) => state.updatePlateQuantity);

  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const [addButtonHover, setAddButtonHover] = useState(false);

  // Load pricing settings
  useEffect(() => {
    getPricingSettings().then(setPricingSettings);
  }, []);

  // Calculate totals
  const totalQuantity = plates.reduce((sum, plate) => sum + plate.quantity, 0);
  const productTotal = pricingSettings
    ? plates.reduce((sum, plate) => {
        const platePrice = calculatePlatePrice(plate, pricingSettings);
        return sum + platePrice * plate.quantity;
      }, 0)
    : 0;
  const totalPrice = plates.length > 0 ? productTotal + PRICING.SHIPPING_FEE : 0;

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
          장바구니
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
            pricingSettings={pricingSettings}
            isMobile={isMobile}
            onSelect={() => selectPlate(plate.id)}
            onQuantityChange={(delta) => {
              if (delta < 0 && plate.quantity === 1) {
                removePlate(plate.id);
              } else {
                updatePlateQuantity(plate.id, plate.quantity + delta);
              }
            }}
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
          <div style={{ fontSize: '14px', fontWeight: 400, marginTop: '4px' }}>새 QR 판</div>
        </div>
      </div>

      {/* Footer: Total summary and checkout */}
      <TotalSummary
        totalQuantity={totalQuantity}
        productTotal={productTotal}
        totalPrice={totalPrice}
        hasPlates={plates.length > 0}
        isMobile={isMobile}
        onCheckout={onCheckout}
      />
    </div>
  );
}
