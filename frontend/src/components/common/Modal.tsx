import React, { useEffect, useRef } from 'react';
import { COLORS } from '../../constants/colors';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  maxWidth?: string;
  draggable?: boolean;
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  width = '600px',
  maxWidth = '90vw',
  draggable = false,
  zIndex = 1000,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.UI.OVERLAY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex,
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    width,
    maxWidth,
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
  };

  const headerStyle: React.CSSProperties = {
    padding: '20px',
    borderBottom: `1px solid ${COLORS.UI.BORDER}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: COLORS.UI.TEXT_SECONDARY,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={modalRef}
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={headerStyle}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
            <button onClick={onClose} style={closeButtonStyle}>×</button>
          </div>
        )}
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
};
