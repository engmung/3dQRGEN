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
        명함 기본 크기로 리셋 (90×50×1.2mm)
      </button>

      <RangeSlider
        label="가로"
        value={plate.cardWidth}
        onChange={(val) => updatePlate(plate.id, { cardWidth: val })}
        min={20}
        max={120}
        step={1}
        unit="mm"
        showValue
      />

      <RangeSlider
        label="세로"
        value={plate.cardHeight}
        onChange={(val) => updatePlate(plate.id, { cardHeight: val })}
        min={20}
        max={80}
        step={1}
        unit="mm"
        showValue
      />

      <RangeSlider
        label="두께"
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
        label="모서리 스타일"
        value={plate.cardCornerStyle ?? 'sharp'}
        onChange={(val) => updatePlate(plate.id, { cardCornerStyle: val as CardCornerStyle })}
        options={[
          { value: 'sharp', label: '뾰족하게' },
          { value: 'rounded', label: '둥글게' },
          { value: 'chamfered', label: '45도 챔퍼' }
        ]}
      />

      {(plate.cardCornerStyle ?? 'sharp') !== 'sharp' && (
        <RangeSlider
          label={(plate.cardCornerStyle ?? 'sharp') === 'rounded' ? '둥근 정도' : '챔퍼 크기'}
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
