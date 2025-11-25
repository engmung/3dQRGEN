/**
 * Total Summary Component
 * Displays total quantity and download button
 */
import React, { useState } from 'react';
import { COLORS } from '../../../constants/colors';

interface TotalSummaryProps {
  hasPlates: boolean;
  isMobile: boolean;
  onDownload: () => void;
}

/**
 * Bottom summary section with download button
 */
export function TotalSummary({
  hasPlates,
  isMobile,
  onDownload,
}: TotalSummaryProps) {
  const [downloadHover, setDownloadHover] = useState(false);

  return (
    <div
      style={{
        padding: isMobile ? '12px 20px' : '12px',
        borderTop: `2px solid ${COLORS.UI.BORDER}`,
        backgroundColor: isMobile ? 'rgba(249, 249, 249, 0.4)' : COLORS.UI.BACKGROUND,
      }}
    >

      {/* Download button */}
      <button
        onClick={onDownload}
        disabled={!hasPlates}
        onMouseEnter={() => setDownloadHover(true)}
        onMouseLeave={() => setDownloadHover(false)}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: !hasPlates
            ? COLORS.UI.TEXT_DISABLED
            : downloadHover
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
        Download OBJ
      </button>
    </div>
  );
}
