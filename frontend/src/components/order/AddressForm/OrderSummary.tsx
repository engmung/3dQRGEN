/**
 * OrderSummary Component
 * Displays order items with detailed price breakdown
 */

import React from 'react';
import { COLORS } from '../../../constants/colors';
import { formatPrice } from '../../../utils/formatters';
import { calculatePlatePrice } from '../../../utils/pricing';
import { getQRTypeLabel } from '../../../utils/qrHelpers';
import type { QRPlateConfig } from '../../../store/useDesignStore';

interface CartItem {
  id: string;
  plateConfig: QRPlateConfig;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  pricingSettings: any;
  productTotal: number;
  shippingFee: number;
  totalPrice: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  pricingSettings,
  productTotal,
  shippingFee,
  totalPrice,
}) => {
  if (!pricingSettings) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>주문 금액 상세</h3>

      {/* Cart Items */}
      {cartItems.map((item, index) => {
        const itemPrice = calculatePlatePrice(item.plateConfig, pricingSettings);
        const itemTotal = itemPrice * item.quantity;

        return (
          <div key={item.id} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemName}>
                #{index + 1} {getQRTypeLabel(item.plateConfig.qrType)} QR × {item.quantity}개
              </span>
              <span style={styles.itemPrice}>{formatPrice(itemTotal)}</span>
            </div>

            <div style={styles.itemDetails}>
              <div>기본: {formatPrice(item.plateConfig.productType === 'card' ? pricingSettings.card_base_price : pricingSettings.base_price)}</div>
              {(item.plateConfig.texts || []).filter(txt => txt.content && txt.content.trim().length > 0).length > 0 && (
                <div>+ 텍스트 {(item.plateConfig.texts || []).filter(txt => txt.content && txt.content.trim().length > 0).length}개: {formatPrice(pricingSettings.text_price * (item.plateConfig.texts || []).filter(txt => txt.content && txt.content.trim().length > 0).length)}</div>
              )}
              {(item.plateConfig.images || []).length > 0 && (
                <div>
                  + 이미지 {(item.plateConfig.images || []).length}개:{' '}
                  {formatPrice(pricingSettings.image_price * (item.plateConfig.images || []).length)}
                </div>
              )}
              <div style={styles.itemSubtotal}>
                = {formatPrice(itemPrice)} × {item.quantity}개
              </div>
            </div>
          </div>
        );
      })}

      {/* Product Total */}
      <div style={styles.subtotalRow}>
        <span style={styles.subtotalLabel}>제품 합계</span>
        <span style={styles.subtotalAmount}>{formatPrice(productTotal)}</span>
      </div>

      {/* Shipping Fee */}
      <div style={styles.shippingRow}>
        <span style={styles.subtotalLabel}>배송비</span>
        <span style={styles.subtotalAmount}>{formatPrice(shippingFee)}</span>
      </div>

      {/* Total */}
      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>총 결제 금액</span>
        <span style={styles.totalAmount}>{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#FAF9F7',
    borderRadius: '8px',
    border: `2px solid ${COLORS.UI.BORDER}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,

  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 700,
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,

  itemCard: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: `1px solid ${COLORS.UI.BORDER}`,
  } as React.CSSProperties,

  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
    gap: '8px',
  } as React.CSSProperties,

  itemName: {
    fontWeight: 600,
    color: COLORS.UI.TEXT_PRIMARY,
    fontSize: '16px',
  } as React.CSSProperties,

  itemPrice: {
    fontWeight: 700,
    color: COLORS.PRIMARY,
    fontSize: '18px',
  } as React.CSSProperties,

  itemDetails: {
    fontSize: '12px',
    color: COLORS.UI.TEXT_SECONDARY,
    paddingLeft: '8px',
    lineHeight: '1.6',
  } as React.CSSProperties,

  itemSubtotal: {
    marginTop: '4px',
    color: COLORS.UI.TEXT_PRIMARY,
    fontWeight: 600,
  } as React.CSSProperties,

  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: `2px solid ${COLORS.UI.BORDER}`,
  } as React.CSSProperties,

  shippingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  } as React.CSSProperties,

  subtotalLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,

  subtotalAmount: {
    fontSize: '18px',
    fontWeight: 600,
    color: COLORS.UI.TEXT_SECONDARY,
  } as React.CSSProperties,

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: `2px solid ${COLORS.UI.TEXT_PRIMARY}`,
  } as React.CSSProperties,

  totalLabel: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,

  totalAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  } as React.CSSProperties,
};
