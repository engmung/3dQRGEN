/**
 * Reusable Modal component
 * Consolidates duplicate modal patterns from 4 components
 */
import React, { type ReactNode } from 'react';
import { MODAL_OVERLAY, MODAL_CONTENT } from '../../styles/modalStyles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

/**
 * Generic modal component with backdrop and centered content
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback when backdrop is clicked
 * @param children - Modal content
 * @param maxWidth - Maximum width of modal content (default: '800px')
 * @param style - Additional styles to merge with default content styles
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = '800px',
  style = {},
}) => {
  if (!isOpen) return null;

  return (
    <div style={MODAL_OVERLAY} onClick={onClose}>
      <div
        style={{ ...MODAL_CONTENT, maxWidth, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
