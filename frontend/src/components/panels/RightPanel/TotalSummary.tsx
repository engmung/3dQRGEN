/**
 * Total Summary Component
 * Displays total quantity, product subtotal, shipping fee, and grand total
 */
import React, { useState } from 'react';
import { COLORS } from '../../../constants/colors';
import { PRICING } from '../../../constants/pricing';
import { formatPrice } from '../../../utils/formatters';
import { AvailabilityBanner } from '../../AvailabilityBanner';

interface TotalSummaryProps {
  totalQuantity: number;
  productTotal: number;
  totalPrice: number;
  hasPlates: boolean;
  isMobile: boolean;
  onCheckout: () => void;
}

/**
 * Bottom summary section with totals and checkout button
 */
export function TotalSummary({
  totalQuantity,
  productTotal,
  totalPrice,
  hasPlates,
  isMobile,
  onCheckout,
}: TotalSummaryProps) {
  const [checkoutHover, setCheckoutHover] = useState(false);
  const [infoHover, setInfoHover] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  return (
    <div
      style={{
        padding: isMobile ? '12px 20px' : '12px',
        borderTop: `2px solid ${COLORS.UI.BORDER}`,
        backgroundColor: isMobile ? 'rgba(249, 249, 249, 0.4)' : COLORS.UI.BACKGROUND,
      }}
    >
      {/* Total summary */}
      {hasPlates && (
        <div
          style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.4)' : '#fff',
            border: `1px solid ${COLORS.UI.BORDER}`,
            borderRadius: '4px',
          }}
        >
          {/* Total quantity */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: COLORS.UI.TEXT_PRIMARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              총 수량
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: COLORS.UI.TEXT_PRIMARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              {totalQuantity}개
            </span>
          </div>

          {/* Product subtotal */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '4px',
              borderTop: `1px solid ${COLORS.UI.BORDER_LIGHT}`,
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: COLORS.UI.TEXT_SECONDARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              제품 합계
            </span>
            <span
              style={{
                fontSize: '13px',
                color: COLORS.UI.TEXT_SECONDARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              {formatPrice(productTotal)}
            </span>
          </div>

          {/* Shipping fee */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '2px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: COLORS.UI.TEXT_SECONDARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              배송비
            </span>
            <span
              style={{
                fontSize: '13px',
                color: COLORS.UI.TEXT_SECONDARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              {formatPrice(PRICING.SHIPPING_FEE)}
            </span>
          </div>

          {/* Grand total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              marginTop: '4px',
              borderTop: `2px solid ${COLORS.UI.BORDER_LIGHT}`,
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.UI.TEXT_PRIMARY,
                ...(isMobile && { textShadow: '0 0 8px rgba(255,255,255,0.9)' }),
              }}
            >
              총 금액
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: COLORS.PRIMARY,
                ...(isMobile && { textShadow: '0 0 8px rgba(255,255,255,0.9)' }),
              }}
            >
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      )}

      {/* Checkout button + info icon */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <button
          onClick={onCheckout}
          disabled={!hasPlates}
          onMouseEnter={() => setCheckoutHover(true)}
          onMouseLeave={() => setCheckoutHover(false)}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: !hasPlates
              ? COLORS.UI.TEXT_DISABLED
              : checkoutHover
              ? COLORS.BUTTON.PRIMARY_HOVER
              : COLORS.BUTTON.PRIMARY,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !hasPlates ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          주문하기
        </button>

        {/* Availability info icon */}
        <button
          onClick={() => setShowAvailabilityModal(true)}
          onMouseEnter={() => setInfoHover(true)}
          onMouseLeave={() => setInfoHover(false)}
          style={{
            width: '48px',
            padding: '14px',
            backgroundColor: infoHover
              ? COLORS.BUTTON.SECONDARY_HOVER
              : COLORS.BUTTON.SECONDARY,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 700,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ⓘ
        </button>
      </div>

      {/* Availability modal */}
      {showAvailabilityModal && (
        <AvailabilityBanner onClose={() => setShowAvailabilityModal(false)} />
      )}
    </div>
  );
}
