interface ColorInfo {
  name: string;
  value: string;
}

interface ColorPaletteEditorProps {
  colors: ColorInfo[];
  onChange: (colors: ColorInfo[]) => void;
  label: string;
}

export function ColorPaletteEditor({ colors, onChange, label }: ColorPaletteEditorProps) {
  const addColor = () => {
    onChange([...colors, { name: '새 색상', value: '#000000' }]);
  };

  const updateColor = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...colors];
    updated[index][field] = value;
    onChange(updated);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: '25px' }}>
      <h4 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>{label}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          >
            {/* 색상 미리보기 */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: color.value,
                border: '2px solid #ccc',
                flexShrink: 0,
              }}
            />

            {/* 색상 이름 */}
            <input
              type="text"
              value={color.name}
              onChange={(e) => updateColor(index, 'name', e.target.value)}
              placeholder="색상 이름"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />

            {/* 색상 코드 */}
            <input
              type="text"
              value={color.value}
              onChange={(e) => updateColor(index, 'value', e.target.value)}
              placeholder="#000000"
              style={{
                width: '90px',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />

            {/* 색상 피커 */}
            <input
              type="color"
              value={color.value}
              onChange={(e) => updateColor(index, 'value', e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />

            {/* 삭제 버튼 */}
            <button
              onClick={() => removeColor(index)}
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
        onClick={addColor}
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
        + 색상 추가
      </button>
    </div>
  );
}
