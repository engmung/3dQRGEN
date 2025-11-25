import { useDesignStore } from '../../../store/useDesignStore';
import { RangeSlider } from '../../common/RangeSlider';
import { Button } from '../../common/Button';
import { PresetImageGrid } from './PresetImageGrid';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import type { QRPlateConfig } from '../../../store/useDesignStore';

interface ImageTabProps {
  plate: QRPlateConfig;
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box' as const,
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px',
};

export function ImageTab({ plate }: ImageTabProps) {
  const isMobile = useIsMobile();
  const removeImage = useDesignStore((state) => state.removeImage);
  const updateImage = useDesignStore((state) => state.updateImage);
  const addImage = useDesignStore((state) => state.addImage);

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
      {/* Preset Image Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Preset Images</label>
        <PresetImageGrid plateId={plate.id} />
      </div>

      {/* Direct Upload */}
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Or Upload Your Own</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              addImage(plate.id, file);
              e.target.value = ''; // Reset input
            }
          }}
          style={inputStyle}
        />
      </div>

      {/* Image List */}
      {(plate.images || []).map((img, index) => (
        <div
          key={img.id}
          style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: isMobile ? 'rgba(245, 245, 245, 0.3)' : '#f5f5f5',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Image {index + 1}</span>
            <Button
              onClick={() => removeImage(plate.id, img.id)}
              variant="danger"
              size="sm"
            >
              Remove
            </Button>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            {img.file.name}
          </div>

          <RangeSlider
            label="Size"
            value={img.size}
            onChange={(val) => updateImage(plate.id, img.id, { size: val })}
            min={3}
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
            label="Vertical Position"
            value={img.heightOffset}
            onChange={(val) => updateImage(plate.id, img.id, { heightOffset: val })}
            min={
              plate.productType === 'card'
                ? -(plate.cardHeight - img.size) / 2
                : -50
            }
            max={
              plate.productType === 'card'
                ? (plate.cardHeight - img.size) / 2
                : 70
            }
            step={0.01}
            unit="mm"
            showValue
            decimals={1}
          />

          <RangeSlider
            label="Horizontal Position"
            value={img.horizontalOffset}
            onChange={(val) => updateImage(plate.id, img.id, { horizontalOffset: val })}
            min={
              plate.productType === 'card'
                ? -(plate.cardWidth - img.size) / 2
                : -30
            }
            max={
              plate.productType === 'card'
                ? (plate.cardWidth - img.size) / 2
                : 30
            }
            step={0.01}
            unit="mm"
            showValue
            decimals={1}
          />
        </div>
      ))}

      {(plate.images || []).length === 0 && (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Add an image to your QR plate
        </div>
      )}
    </div>
  );
}
