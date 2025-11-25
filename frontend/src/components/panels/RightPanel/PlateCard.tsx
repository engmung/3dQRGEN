/**
 * Plate Card Component
 * Individual plate card with preview and controls
 */
import React, { useState } from 'react';
import type { QRPlateConfig } from '../../../store/useDesignStore';
import { COLORS } from '../../../constants/colors';
import { QRPreview } from './QRPreview';
import { PlateControls } from './PlateControls';

interface PlateCardProps {
  plate: QRPlateConfig;
  isSelected: boolean;
  isMobile: boolean;
  onSelect: () => void;
  onQuantityChange: (delta: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Full plate card including preview and controls
 */
export function PlateCard({
  plate,
  isSelected,
  isMobile,
  onSelect,
  onQuantityChange,
  onDuplicate,
  onDelete,
}: PlateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '2 / 1',
    backgroundColor: isSelected ? '#fff' : '#f5f5f5',
    border: isSelected
      ? `3px solid ${COLORS.UI.TEXT_PRIMARY}`
      : `2px solid ${COLORS.UI.BORDER}`,
    borderRadius: '0',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s',
    boxShadow: isSelected
      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
      : isHovered
      ? '0 4px 8px rgba(0, 0, 0, 0.15)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    position: 'relative',
  };

  // Get product type label
  const productTypeLabel = plate.productType === 'card' ? 'Card' : 'Stand';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {/* Card */}
      <div
        style={cardStyle}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <QRPreview plate={plate} />
        <PlateControls
          quantity={plate.quantity}
          onQuantityChange={onQuantityChange}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>

      {/* Info row - product type and quantity */}
      <div
        style={{
          fontSize: '12px',
          color: COLORS.UI.TEXT_PRIMARY,
          padding: '6px 8px',
          backgroundColor: isMobile
            ? 'rgba(249, 249, 249, 0.4)'
            : COLORS.UI.BACKGROUND,
          border: `1px solid ${COLORS.UI.BORDER}`,
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...(isMobile && {
            textShadow: '0 0 6px rgba(255,255,255,0.9)',
          }),
        }}
      >
        <span style={{ fontWeight: 500 }}>{productTypeLabel}</span>
        <span style={{ fontWeight: 600 }}>× {plate.quantity}</span>
      </div>
    </div>
  );
}
