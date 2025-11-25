import { useState } from 'react';
import { MODAL_OVERLAY, MODAL_CONTENT_LARGE } from '../styles/modalStyles';
import { COLORS } from '../styles/colors';
import { useIsMobile } from '../hooks/useMediaQuery';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => Promise<void>;
  itemCount: number;
}

export const DownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  itemCount,
}: DownloadModalProps) => {
  const isMobile = useIsMobile();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await onDownload();
      setDownloadComplete(true);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + (error as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setDownloadComplete(false);
    onClose();
  };

  return (
    <div
      style={{
        ...MODAL_OVERLAY,
        zIndex: isMobile ? 10000 : 1000,
        alignItems: 'center',
        padding: isMobile ? '20px' : '20px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: COLORS.background.white,
          color: COLORS.text.primary,
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {downloadComplete ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Download Complete!</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              Your OBJ files have been downloaded successfully.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 30px',
                backgroundColor: COLORS.primary || '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              Done
            </button>
          </>
        ) : isDownloading ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Generating Files...</h2>
            <p style={{ margin: '0', color: '#666' }}>
              Creating OBJ files for {itemCount} item{itemCount > 1 ? 's' : ''}.
              <br />
              This may take a moment.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>Download OBJ Files</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              You are about to download {itemCount} QR plate{itemCount > 1 ? 's' : ''} as OBJ files.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                Download
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Keep OrderModal as alias for backwards compatibility
export const OrderModal = DownloadModal;
