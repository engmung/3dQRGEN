/**
 * ColorSettings Component
 * Manages color palette and allowed combinations
 */

import { FormTextarea } from '../common/FormTextarea';
import { ColorPaletteEditor } from '../ColorPaletteEditor';
import { ColorCombinationEditor } from '../ColorCombinationEditor';
import type { PricingSettings } from '../../utils/api';

interface ColorInfo {
  name: string;
  value: string;
}

interface ColorCombination {
  colors: string[];
}

interface ColorSettingsProps {
  pricingSettings: PricingSettings;
  onChange: (settings: PricingSettings) => void;
}

export const ColorSettings: React.FC<ColorSettingsProps> = ({
  pricingSettings,
  onChange,
}) => {
  const colors: ColorInfo[] = JSON.parse(pricingSettings.available_colors || '[]');
  const combinations: ColorCombination[] = JSON.parse(pricingSettings.allowed_combinations || '[]');

  const handleColorsChange = (newColors: ColorInfo[]) => {
    onChange({
      ...pricingSettings,
      available_colors: JSON.stringify(newColors),
    });
  };

  const handleCombinationsChange = (newCombinations: ColorCombination[]) => {
    onChange({
      ...pricingSettings,
      allowed_combinations: JSON.stringify(newCombinations),
    });
  };

  const handleWarningMessageChange = (message: string) => {
    onChange({
      ...pricingSettings,
      color_warning_message: message,
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>색상 팔레트 관리</h2>

      <ColorPaletteEditor
        colors={colors}
        onChange={handleColorsChange}
        label="사용 가능한 색상 (출력 가능)"
      />

      <ColorCombinationEditor
        colors={colors}
        combinations={combinations}
        onChange={handleCombinationsChange}
      />

      <div style={{ marginBottom: '25px' }}>
        <FormTextarea
          label="색상 경고 메시지"
          value={pricingSettings.color_warning_message || ''}
          onChange={handleWarningMessageChange}
          placeholder="예: 선택하신 색상 조합은 QR 인식이 어려울 수 있습니다. 주문 시 가장 유사한 허용 조합으로 변환됩니다."
          rows={3}
          helperText="사용자가 허용되지 않은 색상 조합을 선택했을 때 표시되는 메시지입니다."
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '2px solid #FF9800',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
  },
};
