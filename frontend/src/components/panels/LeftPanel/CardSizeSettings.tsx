import { useDesignStore } from '../../../store/useDesignStore';
import { RangeSlider } from '../../common/RangeSlider';
import { FormSelect } from '../../common/FormSelect';
import type { QRPlateConfig } from '../../../store/useDesignStore';
import type { CardCornerStyle } from '../../../types/design';

interface CardSizeSettingsProps {
  plate: QRPlateConfig;
}

export function CardSizeSettings({ plate }: CardSizeSettingsProps) {
  const updatePlate = useDesignStore((state) => state.updatePlate);

  const resetToDefault = () => {
    updatePlate(plate.id, { cardWidth: 90, cardHeight: 50, cardThickness: 1.2 });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={resetToDefault}
        style={{
          width: '100%',
          padding: '8px 12px',
          marginBottom: '12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        Reset to Default (90x50x1.2mm)
      </button>

      <RangeSlider
        label="Width"
        value={plate.cardWidth}
        onChange={(val) => updatePlate(plate.id, { cardWidth: val })}
        min={20}
        max={120}
        step={1}
        unit="mm"
        showValue
      />

      <RangeSlider
        label="Height"
        value={plate.cardHeight}
        onChange={(val) => updatePlate(plate.id, { cardHeight: val })}
        min={20}
        max={80}
        step={1}
        unit="mm"
        showValue
      />

      <RangeSlider
        label="Thickness"
        value={plate.cardThickness}
        onChange={(val) => updatePlate(plate.id, { cardThickness: val })}
        min={0.4}
        max={3}
        step={0.1}
        unit="mm"
        showValue
        decimals={1}
      />

      <FormSelect
        label="Corner Style"
        value={plate.cardCornerStyle ?? 'sharp'}
        onChange={(val) => updatePlate(plate.id, { cardCornerStyle: val as CardCornerStyle })}
        options={[
          { value: 'sharp', label: 'Sharp' },
          { value: 'rounded', label: 'Rounded' },
          { value: 'chamfered', label: '45° Chamfer' }
        ]}
      />

      {(plate.cardCornerStyle ?? 'sharp') !== 'sharp' && (
        <RangeSlider
          label={(plate.cardCornerStyle ?? 'sharp') === 'rounded' ? 'Corner Radius' : 'Chamfer Size'}
          value={plate.cardCornerRadius ?? 2}
          onChange={(val) => updatePlate(plate.id, { cardCornerRadius: val })}
          min={0.5}
          max={20}
          step={0.5}
          unit="mm"
          showValue
          decimals={1}
        />
      )}
    </div>
  );
}
