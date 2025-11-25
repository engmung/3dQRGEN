import { useDesignStore } from '../../../store/useDesignStore';
import { AVAILABLE_FONTS } from '../../../utils/fontLoader';
import { RangeSlider } from '../../common/RangeSlider';
import { FormField } from '../../common/FormField';
import { FormSelect } from '../../common/FormSelect';
import { Button } from '../../common/Button';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import type { QRPlateConfig } from '../../../store/useDesignStore';

interface TextTabProps {
  plate: QRPlateConfig;
}

export function TextTab({ plate }: TextTabProps) {
  const isMobile = useIsMobile();
  const addText = useDesignStore((state) => state.addText);
  const removeText = useDesignStore((state) => state.removeText);
  const updateText = useDesignStore((state) => state.updateText);

  const fontOptions = Object.entries(AVAILABLE_FONTS).map(([key, info]) => ({
    value: key,
    label: info.label,
  }));

  return (
    <div>
      {/* Add Text Button */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ width: '100%' }}>
          <Button
            onClick={() => addText(plate.id, '')}
            variant="primary"
          >
            + Add Text
          </Button>
        </div>
      </div>

      {/* Text List */}
      {(plate.texts || []).map((txt, index) => (
        <div
          key={txt.id}
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
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Text {index + 1}</span>
            <Button
              onClick={() => removeText(plate.id, txt.id)}
              variant="danger"
              size="sm"
            >
              Remove
            </Button>
          </div>

          <FormField
            label="Content"
            type="text"
            value={txt.content}
            onChange={(value) => updateText(plate.id, txt.id, { content: value })}
            placeholder="Enter text"
          />

          <FormSelect
            label="Font"
            value={txt.font}
            onChange={(value) => updateText(plate.id, txt.id, { font: value })}
            options={fontOptions}
          />

          <RangeSlider
            label="Size"
            value={txt.size}
            onChange={(val) => updateText(plate.id, txt.id, { size: val })}
            min={2}
            max={30}
            step={0.1}
            unit="mm"
            showValue
            decimals={1}
          />

          <RangeSlider
            label="Vertical Position"
            value={txt.heightOffset}
            onChange={(val) => updateText(plate.id, txt.id, { heightOffset: val })}
            min={plate.productType === 'card' ? -plate.cardHeight / 2 : -50}
            max={plate.productType === 'card' ? plate.cardHeight / 2 : 70}
            step={0.01}
            unit="mm"
            showValue
            decimals={1}
          />

          <RangeSlider
            label="Horizontal Position"
            value={txt.horizontalOffset}
            onChange={(val) => updateText(plate.id, txt.id, { horizontalOffset: val })}
            min={plate.productType === 'card' ? -plate.cardWidth / 2 : -30}
            max={plate.productType === 'card' ? plate.cardWidth / 2 : 30}
            step={0.01}
            unit="mm"
            showValue
            decimals={1}
          />
        </div>
      ))}

      {(plate.texts || []).length === 0 && (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Add text to your QR plate
        </div>
      )}
    </div>
  );
}
