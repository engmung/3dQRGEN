/**
 * Plate Controls Component
 * Quantity controls and action buttons (duplicate/delete)
 */
import React, { useState } from 'react';
import { COLORS } from '../../../constants/colors';

interface PlateControlsProps {
  quantity: number;
  onQuantityChange: (delta: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Right-side controls for plate card (50% width)
 * Top half: quantity controls
 * Bottom half: duplicate/delete buttons
 */
export function PlateControls({
  quantity,
  onQuantityChange,
  onDuplicate,
  onDelete,
}: PlateControlsProps) {
  const [copyHover, setCopyHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  return (
    <div
      style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top: Quantity controls */}
      <div
        style={{
          height: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '4px',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 600, marginRight: '2px' }}>수량:</span>
        <span style={{ fontSize: '24px', fontWeight: 700, marginRight: '4px' }}>{quantity}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(-1);
          }}
          style={{
            width: '26px',
            height: '26px',
            border: `1px solid ${COLORS.UI.BORDER}`,
            borderRadius: '0',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
          }}
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuantityChange(1);
          }}
          style={{
            width: '26px',
            height: '26px',
            border: `1px solid ${COLORS.UI.BORDER}`,
            borderRadius: '0',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
          }}
        >
          +
        </button>
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
          복사
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
          삭제
        </button>
      </div>
    </div>
  );
}
