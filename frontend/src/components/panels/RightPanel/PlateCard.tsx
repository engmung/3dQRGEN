/**
 * Plate Card Component
 * Individual plate card with preview, controls, and price breakdown
 */
import React, { useState } from 'react';
import type { QRPlateConfig } from '../../../store/useDesignStore';
import type { PricingSettings } from '../../../utils/api';
import { calculatePlatePrice } from '../../../utils/pricing';
import { formatPrice } from '../../../utils/formatters';
import { COLORS } from '../../../constants/colors';
import { QRPreview } from './QRPreview';
import { PlateControls } from './PlateControls';

interface PlateCardProps {
  plate: QRPlateConfig;
  isSelected: boolean;
  pricingSettings: PricingSettings | null;
  isMobile: boolean;
  onSelect: () => void;
  onQuantityChange: (delta: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Full plate card including preview, controls, and price details
 */
export function PlateCard({
  plate,
  isSelected,
  pricingSettings,
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

      {/* Price breakdown */}
      {pricingSettings && (
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
            ...(isMobile && {
              textShadow: '0 0 6px rgba(255,255,255,0.9)',
            }),
          }}
        >
          {/* Base price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>기본 ({plate.productType === 'card' ? '명함' : '거치대'})</span>
            <span>
              {formatPrice(
                plate.productType === 'card'
                  ? pricingSettings.card_base_price
                  : pricingSettings.base_price
              )}
            </span>
          </div>

          {/* Text addon */}
          {plate.text && plate.text.trim().length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>+ 텍스트</span>
              <span>{formatPrice(pricingSettings.text_price)}</span>
            </div>
          )}

          {/* Image addon */}
          {plate.images.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>+ 이미지 {plate.images.length}개</span>
              <span>{formatPrice(pricingSettings.image_price * plate.images.length)}</span>
            </div>
          )}

          {/* Unit price */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '4px',
              marginTop: '4px',
              borderTop: `1px solid ${COLORS.UI.BORDER_LIGHT}`,
              fontWeight: 600,
              color: COLORS.UI.TEXT_PRIMARY,
            }}
          >
            <span>개당</span>
            <span>{formatPrice(calculatePlatePrice(plate, pricingSettings))}</span>
          </div>

          {/* Total (with quantity) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '4px',
              marginTop: '4px',
              borderTop: `1px solid ${COLORS.UI.BORDER_LIGHT}`,
              fontSize: '14px',
              fontWeight: 700,
              color: COLORS.PRIMARY,
            }}
          >
            <span>× {plate.quantity}개</span>
            <span>{formatPrice(calculatePlatePrice(plate, pricingSettings) * plate.quantity)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
