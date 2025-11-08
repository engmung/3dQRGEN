/**
 * QR Preview Component
 * Displays QR code preview based on plate configuration
 */
import { useEffect, useState } from 'react';
import type { QRPlateConfig } from '../../../store/useDesignStore';
import { generateQRString } from '../../../utils/qrGenerator';
import { generateQRBitmap } from '../../../utils/qrUtils';

interface QRPreviewProps {
  plate: QRPlateConfig;
}

/**
 * Renders QR code preview with real-time generation
 * Shows QR bitmap overlaid on plate color
 */
export function QRPreview({ plate }: QRPreviewProps) {
  const [qrBitmap, setQrBitmap] = useState<{ data: boolean[][]; size: number } | null>(null);

  useEffect(() => {
    // Generate QR string based on type
    let qrString = '';
    try {
      if (plate.qrType === 'url') {
        qrString = generateQRString('url', plate.qrUrl);
      } else if (plate.qrType === 'wifi') {
        qrString = generateQRString('wifi', plate.qrWifiData);
      } else if (plate.qrType === 'email') {
        qrString = generateQRString('email', plate.qrEmailData);
      }
    } catch (error) {
      console.error('QR string generation error:', error);
      return;
    }

    if (!qrString || qrString.trim() === '') {
      setQrBitmap(null);
      return;
    }

    // Generate QR bitmap
    generateQRBitmap(qrString)
      .then((bitmap) => setQrBitmap(bitmap))
      .catch((err) => {
        console.error('QR bitmap generation error:', err);
        setQrBitmap(null);
      });
  }, [plate.qrType, plate.qrUrl, plate.qrWifiData, plate.qrEmailData]);

  return (
    <div
      style={{
        width: '50%',
        height: '100%',
        backgroundColor: plate.plateColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0px',
      }}
    >
      {qrBitmap && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${qrBitmap.size}, 1fr)`,
            gap: '0px',
            width: '100%',
            height: '100%',
          }}
        >
          {qrBitmap.data.flat().map((filled, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: filled ? plate.qrColor : plate.plateColor,
                width: '100%',
                height: '100%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
