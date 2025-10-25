import { useDesignerStore } from '../../store/useDesignerStore';

export const ParameterPanel = () => {
  const { selectedTemplate, parameters, updateParameter, resetParameters } = useDesignerStore();

  if (!selectedTemplate) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#999'
      }}>
        템플릿을 선택하세요
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderLeft: '1px solid #ddd'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0 }}>{selectedTemplate.name}</h3>
        <button
          onClick={resetParameters}
          style={{
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          초기화
        </button>
      </div>

      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        {selectedTemplate.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {selectedTemplate.parameters.map(param => {
          const value = parameters[param.key];

          return (
            <div key={param.key}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '5px',
                color: '#333'
              }}>
                {param.label}
                {param.unit && <span style={{ color: '#999', marginLeft: '5px' }}>({param.unit})</span>}
              </label>

              {param.type === 'number' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateParameter(param.key, parseFloat(e.target.value))}
                    min={param.min}
                    max={param.max}
                    step={param.step || 1}
                    style={{
                      padding: '8px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                  />
                  <input
                    type="range"
                    value={value}
                    onChange={(e) => updateParameter(param.key, parseFloat(e.target.value))}
                    min={param.min}
                    max={param.max}
                    step={param.step || 1}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {param.type === 'text' && (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateParameter(param.key, e.target.value)}
                  style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100%'
                  }}
                />
              )}

              {param.type === 'boolean' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateParameter(param.key, e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#666' }}>활성화</span>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
