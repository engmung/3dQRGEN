import { useDesignStore } from '../../../store/useDesignStore';
import { AVAILABLE_FONTS } from '../../../utils/fontLoader';
import { RangeSlider } from '../../common/RangeSlider';
import { FormField } from '../../common/FormField';
import { FormSelect } from '../../common/FormSelect';
import type { QRPlateConfig } from '../../../store/useDesignStore';

interface TextTabProps {
  plate: QRPlateConfig;
}

export function TextTab({ plate }: TextTabProps) {
  const updatePlate = useDesignStore((state) => state.updatePlate);

  const fontOptions = Object.entries(AVAILABLE_FONTS).map(([key, info]) => ({
    value: key,
    label: info.label,
  }));

  return (
    <div>
      <FormField
        label="텍스트 내용"
        type="text"
        value={plate.text}
        onChange={(value) => updatePlate(plate.id, { text: value })}
        placeholder="텍스트 입력 (선택사항)"
      />

      <FormSelect
        label="폰트"
        value={plate.textFont}
        onChange={(value) => updatePlate(plate.id, { textFont: value })}
        options={fontOptions}
      />

      <RangeSlider
        label="텍스트 크기"
        value={plate.textSize}
        onChange={(val) => updatePlate(plate.id, { textSize: val })}
        min={2}
        max={30}
        step={0.1}
        unit="mm"
        showValue
        decimals={1}
      />

      <RangeSlider
        label="텍스트 높이"
        value={plate.textHeightOffset}
        onChange={(val) => updatePlate(plate.id, { textHeightOffset: val })}
        min={plate.productType === 'card' ? -plate.cardHeight / 2 : -50}
        max={plate.productType === 'card' ? plate.cardHeight / 2 : 70}
        step={0.01}
        unit="mm"
        showValue
        decimals={1}
      />

      <RangeSlider
        label="텍스트 좌우"
        value={plate.textHorizontalOffset}
        onChange={(val) => updatePlate(plate.id, { textHorizontalOffset: val })}
        min={plate.productType === 'card' ? -plate.cardWidth / 2 : -30}
        max={plate.productType === 'card' ? plate.cardWidth / 2 : 30}
        step={0.01}
        unit="mm"
        showValue
        decimals={1}
      />
    </div>
  );
}
