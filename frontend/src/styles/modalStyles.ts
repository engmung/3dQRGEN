/**
 * Reusable modal styles
 * Consolidates duplicate modal patterns from 4 components
 */
import React from 'react';
import { COLORS } from './colors';
import { Z_INDEX } from './spacing';

export const MODAL_OVERLAY: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: COLORS.background.overlay,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: Z_INDEX.modal,
};

export const MODAL_CONTENT: React.CSSProperties = {
  backgroundColor: COLORS.background.white,
  padding: '30px',
  borderRadius: '8px',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

export const MODAL_CONTENT_LARGE: React.CSSProperties = {
  ...MODAL_CONTENT,
  maxWidth: '1200px',
  width: '90vw',
};

export const MODAL_CONTENT_MEDIUM: React.CSSProperties = {
  ...MODAL_CONTENT,
  maxWidth: '800px',
  width: '80vw',
};

export const MODAL_CONTENT_SMALL: React.CSSProperties = {
  ...MODAL_CONTENT,
  maxWidth: '500px',
  width: '60vw',
};

export const MODAL_HEADER: React.CSSProperties = {
  marginBottom: '20px',
  fontSize: '20px',
  fontWeight: 'bold',
};

export const MODAL_FOOTER: React.CSSProperties = {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
};
