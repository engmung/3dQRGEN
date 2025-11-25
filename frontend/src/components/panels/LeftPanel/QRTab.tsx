import { useDesignStore } from '../../../store/useDesignStore';
import { QRTypeSelector } from '../../QRTypeSelector';
import { ProductTypeSelector } from '../../ProductTypeSelector';
import { WiFiForm } from '../../forms/WiFiForm';
import { EmailForm } from '../../forms/EmailForm';
import { RangeSlider } from '../../common/RangeSlider';
import { FormField } from '../../common/FormField';
import { CardSizeSettings } from './CardSizeSettings';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import type { QRPlateConfig, QRType } from '../../../store/useDesignStore';

interface QRTabProps {
  plate: QRPlateConfig;
}

const sectionStyle = {
  marginBottom: '20px',
};

export function QRTab({ plate }: QRTabProps) {
  const updatePlate = useDesignStore((state) => state.updatePlate);
  const isMobile = useIsMobile();

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '16px',
    color: '#333',
    ...(isMobile && {
      textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)',
    }),
  };

  return (
    <div>
      {/* Product Type Selection */}
      <ProductTypeSelector />

      {/* Card Size Settings */}
      {plate.productType === 'card' && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Card Size</label>
          <CardSizeSettings plate={plate} />
        </div>
      )}

      {/* QR Type Selection */}
      <div style={sectionStyle}>
        <QRTypeSelector
          value={plate.qrType}
          onChange={(type: QRType) => updatePlate(plate.id, { qrType: type })}
        />
      </div>

      {/* QR Data Input */}
      <div style={sectionStyle}>
        {plate.qrType === 'url' && (
          <FormField
            label="URL"
            type="text"
            value={plate.qrUrl}
            onChange={(value) => updatePlate(plate.id, { qrUrl: value })}
            placeholder="https://example.com"
          />
        )}

        {plate.qrType === 'wifi' && (
          <WiFiForm
            data={plate.qrWifiData}
            onChange={(data) => updatePlate(plate.id, { qrWifiData: data })}
          />
        )}

        {plate.qrType === 'email' && (
          <EmailForm
            data={plate.qrEmailData}
            onChange={(data) => updatePlate(plate.id, { qrEmailData: data })}
          />
        )}
      </div>

      {/* QR Settings */}
      <div style={sectionStyle}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: '15px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#333',
            ...(isMobile && {
              textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)',
            }),
          }}
        >
          QR Settings
        </h3>

        <RangeSlider
          label="QR Size"
          value={plate.qrSize}
          onChange={(val) => updatePlate(plate.id, { qrSize: val })}
          min={20}
          max={
            plate.productType === 'card'
              ? Math.min(plate.cardWidth, plate.cardHeight) - 5
              : 60
          }
          step={0.1}
          unit="mm"
          showValue
          decimals={1}
        />

        <RangeSlider
          label="QR Thickness"
          value={plate.qrThickness}
          onChange={(val) => updatePlate(plate.id, { qrThickness: val })}
          min={0.2}
          max={3}
          step={0.01}
          unit="mm"
          showValue
          decimals={1}
        />

        <RangeSlider
          label="Vertical Position"
          value={plate.qrHeightOffset}
          onChange={(val) => updatePlate(plate.id, { qrHeightOffset: val })}
          min={
            plate.productType === 'card'
              ? -(plate.cardHeight - plate.qrSize) / 2
              : -50
          }
          max={
            plate.productType === 'card'
              ? (plate.cardHeight - plate.qrSize) / 2
              : 30
          }
          step={0.01}
          unit="mm"
          showValue
          decimals={1}
        />

        <RangeSlider
          label="Horizontal Position"
          value={plate.qrHorizontalOffset}
          onChange={(val) => updatePlate(plate.id, { qrHorizontalOffset: val })}
          min={
            plate.productType === 'card'
              ? -(plate.cardWidth - plate.qrSize) / 2
              : -(60 - plate.qrSize) / 2
          }
          max={
            plate.productType === 'card'
              ? (plate.cardWidth - plate.qrSize) / 2
              : (60 - plate.qrSize) / 2
          }
          step={0.01}
          unit="mm"
          showValue
          decimals={1}
        />
      </div>
    </div>
  );
}
