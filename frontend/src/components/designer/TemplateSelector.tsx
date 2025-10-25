import { useDesignerStore } from '../../store/useDesignerStore';
import { LShapeStand } from '../../templates/LShapeStand';
import type { DesignTemplate } from '../../templates/types';

// 사용 가능한 템플릿 목록
const TEMPLATES: DesignTemplate[] = [
  LShapeStand,
  // 나중에 추가 템플릿들
];

export const TemplateSelector = () => {
  const { selectedTemplate, selectTemplate } = useDesignerStore();

  return (
    <div style={{
      width: '250px',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #ddd',
      padding: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>템플릿 선택</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => selectTemplate(template)}
            style={{
              padding: '15px',
              textAlign: 'left',
              backgroundColor: selectedTemplate?.id === template.id ? '#4CAF50' : '#fff',
              color: selectedTemplate?.id === template.id ? '#fff' : '#333',
              border: selectedTemplate?.id === template.id ? '2px solid #45a049' : '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: selectedTemplate?.id === template.id ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (selectedTemplate?.id !== template.id) {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTemplate?.id !== template.id) {
                e.currentTarget.style.backgroundColor = '#fff';
              }
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
              {template.name}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {template.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
