/**
 * Price Breakdown Component
 * Displays itemized price breakdown in table format
 */
import React from 'react';
import { COLORS } from '../../constants/colors';
import { PRICING } from '../../constants/pricing';
import { formatPrice } from '../../utils/formatters';

interface PriceItem {
  label: string;
  amount: number;
}

interface PriceBreakdownProps {
  items: PriceItem[];
  total: number;
  showShipping?: boolean;
}

/**
 * Table-style price breakdown with formatted currency
 * Uses formatPrice from formatters.ts for consistent formatting
 */
export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  items,
  total,
  showShipping = true,
}) => {
  return (
    <div
      style={{
        width: '100%',
        border: `1px solid ${COLORS.UI.BORDER}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {/* Item rows */}
      <div style={{ padding: '16px' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom:
                index < items.length - 1
                  ? `1px solid ${COLORS.UI.BORDER_LIGHT}`
                  : 'none',
            }}
          >
            <span
              style={{
                color: COLORS.UI.TEXT_PRIMARY,
                fontSize: '14px',
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                color: COLORS.UI.TEXT_PRIMARY,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {formatPrice(item.amount)}
            </span>
          </div>
        ))}

        {/* Shipping fee */}
        {showShipping && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              marginTop: items.length > 0 ? '4px' : 0,
            }}
          >
            <span
              style={{
                color: COLORS.UI.TEXT_SECONDARY,
                fontSize: '14px',
              }}
            >
              배송비
            </span>
            <span
              style={{
                color: COLORS.UI.TEXT_SECONDARY,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {formatPrice(PRICING.SHIPPING_FEE)}
            </span>
          </div>
        )}
      </div>

      {/* Total row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: COLORS.UI.BACKGROUND,
          borderTop: `2px solid ${COLORS.UI.BORDER}`,
        }}
      >
        <span
          style={{
            color: COLORS.UI.TEXT_PRIMARY,
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          총 결제금액
        </span>
        <span
          style={{
            color: COLORS.PRIMARY,
            fontSize: '18px',
            fontWeight: 700,
          }}
        >
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
};
