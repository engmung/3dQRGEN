import { useDesignStore } from '../../../store/useDesignStore';
import { RangeSlider } from '../../common/RangeSlider';
import type { QRPlateConfig } from '../../../store/useDesignStore';

interface CardSizeSettingsProps {
  plate: QRPlateConfig;
}

export function CardSizeSettings({ plate }: CardSizeSettingsProps) {
  const updatePlate = useDesignStore((state) => state.updatePlate);

  return (
    <div style={{ marginBottom: '20px' }}>
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
        min={1}
        max={3}
        step={0.1}
        unit="mm"
        showValue
        decimals={1}
      />
    </div>
  );
}
