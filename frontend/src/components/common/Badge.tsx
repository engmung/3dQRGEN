/**
 * Badge Component
 * Displays status badges with predefined color variants
 */
import React from 'react';
import { COLORS } from '../../constants/colors';

type BadgeVariant =
  | 'pending'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface BadgeProps {
  text: string;
  variant: BadgeVariant;
}

/**
 * Small pill-shaped badge for displaying status
 * Uses COLORS.STATUS for variant colors
 */
export const Badge: React.FC<BadgeProps> = ({ text, variant }) => {
  const getColor = (v: BadgeVariant): string => {
    switch (v) {
      case 'pending':
        return COLORS.STATUS.PENDING;
      case 'paid':
        return COLORS.STATUS.PAID;
      case 'in_production':
        return COLORS.STATUS.IN_PRODUCTION;
      case 'shipped':
        return COLORS.STATUS.SHIPPED;
      case 'delivered':
        return COLORS.STATUS.DELIVERED;
      case 'cancelled':
        return COLORS.STATUS.CANCELLED;
      default:
        return COLORS.UI.TEXT_SECONDARY;
    }
  };

  const backgroundColor = getColor(variant);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: '12px',
        backgroundColor,
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        lineHeight: 1.2,
      }}
    >
      {text}
    </span>
  );
};
