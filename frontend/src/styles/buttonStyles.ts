/**
 * Reusable button styles
 * Consolidates 40+ instances of inline button styles
 */
import React from 'react';
import { COLORS } from './colors';

export const BUTTON_BASE: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'opacity 0.2s',
};

export const BUTTON_PRIMARY: React.CSSProperties = {
  ...BUTTON_BASE,
  backgroundColor: COLORS.primary,
  color: 'white',
};

export const BUTTON_DANGER: React.CSSProperties = {
  ...BUTTON_BASE,
  backgroundColor: COLORS.danger,
  color: 'white',
};

export const BUTTON_SECONDARY: React.CSSProperties = {
  ...BUTTON_BASE,
  backgroundColor: COLORS.secondary,
  color: 'white',
};

export const BUTTON_INFO: React.CSSProperties = {
  ...BUTTON_BASE,
  backgroundColor: COLORS.info,
  color: 'white',
};

export const BUTTON_WARNING: React.CSSProperties = {
  ...BUTTON_BASE,
  backgroundColor: COLORS.warning,
  color: 'white',
};

export const BUTTON_SMALL: React.CSSProperties = {
  ...BUTTON_BASE,
  padding: '6px 12px',
  fontSize: '12px',
};

export const BUTTON_LARGE: React.CSSProperties = {
  ...BUTTON_BASE,
  padding: '12px 24px',
  fontSize: '16px',
};
