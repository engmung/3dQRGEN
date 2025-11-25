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

  return (
    <div
      style={cardStyle}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <QRPreview plate={plate} />
      <PlateControls
        productType={plate.productType}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  );
}
