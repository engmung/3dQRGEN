/**
 * Plate Controls Component
 * Product type label and action buttons (duplicate/delete)
 */
import React, { useState } from 'react';
import { COLORS } from '../../../constants/colors';

interface PlateControlsProps {
  productType: 'stand' | 'card';
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Right-side controls for plate card (50% width)
 * Top: Product type label
 * Bottom: Duplicate/Delete buttons
 */
export function PlateControls({
  productType,
  onDuplicate,
  onDelete,
}: PlateControlsProps) {
  const [copyHover, setCopyHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const productTypeLabel = productType === 'card' ? 'Card' : 'Stand';

  return (
    <div
      style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top: Product type label */}
      <div
        style={{
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 600,
          color: COLORS.UI.TEXT_PRIMARY,
        }}
      >
        {productTypeLabel}
      </div>

      {/* Bottom: Duplicate/Delete buttons */}
      <div
        style={{
          height: '50%',
          display: 'flex',
          gap: '0',
        }}
      >
        {/* Left: Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          onMouseEnter={() => setCopyHover(true)}
          onMouseLeave={() => setCopyHover(false)}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: '0',
            backgroundColor: copyHover ? '#777' : '#999',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Copy
        </button>

        {/* Right: Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          style={{
            flex: 1,
            border: 'none',
            borderRadius: '0',
            backgroundColor: deleteHover ? COLORS.BUTTON.DANGER_HOVER : COLORS.BUTTON.DANGER,
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
