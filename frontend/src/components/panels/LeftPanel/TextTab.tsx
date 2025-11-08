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
      {/* 텍스트 추가 버튼 */}
      <div style={{ marginBottom: '15px' }}>
        <Button
          onClick={() => addText(plate.id, '')}
          variant="primary"
          style={{ width: '100%' }}
        >
          + 텍스트 추가
        </Button>
      </div>

      {/* 텍스트 리스트 */}
      {plate.texts.map((txt, index) => (
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
            <span style={{ fontSize: '14px', fontWeight: 600 }}>텍스트 {index + 1}</span>
            <Button
              onClick={() => removeText(plate.id, txt.id)}
              variant="danger"
              size="sm"
            >
              제거
            </Button>
          </div>

          <FormField
            label="내용"
            type="text"
            value={txt.content}
            onChange={(value) => updateText(plate.id, txt.id, { content: value })}
            placeholder="텍스트 입력"
          />

          <FormSelect
            label="폰트"
            value={txt.font}
            onChange={(value) => updateText(plate.id, txt.id, { font: value })}
            options={fontOptions}
          />

          <RangeSlider
            label="크기"
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
            label="높이"
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
            label="좌우"
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

      {plate.texts.length === 0 && (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          텍스트를 추가하세요
        </div>
      )}
    </div>
  );
}
