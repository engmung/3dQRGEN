/**
 * Total Summary Component
 * Displays total quantity and download button
 */
import React, { useState } from 'react';
import { COLORS } from '../../../constants/colors';

interface TotalSummaryProps {
  totalQuantity: number;
  hasPlates: boolean;
  isMobile: boolean;
  onDownload: () => void;
}

/**
 * Bottom summary section with quantity and download button
 */
export function TotalSummary({
  totalQuantity,
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
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: COLORS.UI.TEXT_PRIMARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              Total Items
            </span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: COLORS.UI.TEXT_PRIMARY,
                ...(isMobile && { textShadow: '0 0 6px rgba(255,255,255,0.9)' }),
              }}
            >
              {totalQuantity}
            </span>
          </div>
        </div>
      )}

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
