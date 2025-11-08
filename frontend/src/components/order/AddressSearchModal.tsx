/**
 * AddressSearchModal Component
 * Modal for Daum postcode search
 */

import React from 'react';
import DaumPostcode from 'react-daum-postcode';
import { COLORS } from '../../constants/colors';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const AddressSearchModal: React.FC<AddressSearchModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const isMobile = useIsMobile();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={{ ...styles.modal, ...(isMobile && styles.modalMobile) }}>
        <div style={styles.header}>
          <h3 style={{ ...styles.title, ...(isMobile && styles.titleMobile) }}>
            우편번호 검색
          </h3>
          <button onClick={onClose} style={{ ...styles.closeButton, ...(isMobile && styles.closeButtonMobile) }}>
            닫기
          </button>
        </div>
        <div style={styles.content}>
          <DaumPostcode onComplete={onComplete} />
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.UI.OVERLAY,
    zIndex: 1999,
  } as React.CSSProperties,

  modal: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '1px solid #000',
    borderRadius: '8px',
    zIndex: 2000,
    width: 'auto',
    maxWidth: '600px',
    maxHeight: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  } as React.CSSProperties,

  modalMobile: {
    width: '95%',
    maxWidth: '95vw',
    maxHeight: '90vh',
  } as React.CSSProperties,

  header: {
    padding: '15px',
    backgroundColor: '#F5F5F5',
    borderBottom: `1px solid ${COLORS.UI.BORDER}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: COLORS.UI.TEXT_PRIMARY,
  } as React.CSSProperties,

  titleMobile: {
    fontSize: '14px',
  } as React.CSSProperties,

  closeButton: {
    padding: '6px 12px',
    backgroundColor: COLORS.DANGER,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  } as React.CSSProperties,

  closeButtonMobile: {
    fontSize: '12px',
    padding: '5px 10px',
  } as React.CSSProperties,

  content: {
    flex: 1,
    overflow: 'auto',
  } as React.CSSProperties,
};
