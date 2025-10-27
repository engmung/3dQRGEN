interface ColorInfo {
  name: string;
  value: string;
}

interface ColorCombination {
  colors: string[];
}

interface ColorCombinationEditorProps {
  colors: ColorInfo[];
  combinations: ColorCombination[];
  onChange: (combinations: ColorCombination[]) => void;
}

export function ColorCombinationEditor({ colors, combinations, onChange }: ColorCombinationEditorProps) {
  const addCombination = () => {
    const color1 = colors[0]?.value || '#FFFFFF';
    const color2 = colors[1]?.value || '#000000';
    onChange([...combinations, { colors: [color1, color2] }]);
  };

  const updateCombination = (index: number, colorIndex: 0 | 1, value: string) => {
    const updated = [...combinations];
    const newColors = [...updated[index].colors];
    newColors[colorIndex] = value;
    updated[index] = { colors: newColors };
    onChange(updated);
  };

  const removeCombination = (index: number) => {
    onChange(combinations.filter((_, i) => i !== index));
  };

  const getColorName = (value: string) => {
    const color = colors.find(c => c.value.toLowerCase() === value.toLowerCase());
    return color?.name || value;
  };

  return (
    <div style={{ marginBottom: '25px' }}>
      <h4 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>
        ✅ 허용된 색상 조합 (QR 인식 가능)
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {combinations.map((combo, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f0f8f0',
              borderRadius: '6px',
              border: '2px solid #4CAF50',
            }}
          >
            {/* 색상 1 선택 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>색상 1</div>
              <select
                value={combo.colors[0]}
                onChange={(e) => updateCombination(index, 0, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              >
                {colors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 색상 1 미리보기 */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: combo.colors[0],
                border: '2px solid #333',
                flexShrink: 0,
              }}
              title={getColorName(combo.colors[0])}
            />

            <div style={{ fontSize: '20px', color: '#999' }}>+</div>

            {/* 색상 2 선택 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>색상 2</div>
              <select
                value={combo.colors[1]}
                onChange={(e) => updateCombination(index, 1, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              >
                {colors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 색상 2 미리보기 */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: combo.colors[1],
                border: '2px solid #333',
                flexShrink: 0,
              }}
              title={getColorName(combo.colors[1])}
            />

            {/* 삭제 버튼 */}
            <button
              onClick={() => removeCombination(index)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                flexShrink: 0,
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ff5252')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 추가 버튼 */}
      <button
        onClick={addCombination}
        style={{
          marginTop: '12px',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          width: '100%',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
      >
        + 조합 추가
      </button>

      {/* 안내 메시지 */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#856404',
      }}>
        💡 <strong>QR 인식 팁:</strong> 두 색상의 대비가 높을수록 인식률이 좋습니다.
        (예: 흰색 + 검정, 핑크 + 검정) 판/QR 순서는 자유롭게 선택 가능합니다.
      </div>
    </div>
  );
}
