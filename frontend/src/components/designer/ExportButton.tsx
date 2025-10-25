import { useDesignerStore } from '../../store/useDesignerStore';
import { serialize } from '@jscad/stl-serializer';

export const ExportButton = () => {
  const { selectedTemplate, parameters } = useDesignerStore();

  const handleExportSTL = () => {
    if (!selectedTemplate) {
      alert('템플릿을 먼저 선택하세요');
      return;
    }

    try {
      // JSCAD geometry 생성
      const geom = selectedTemplate.generate(parameters);

      // STL binary 직렬화
      const stlData = serialize({ binary: true }, geom);

      // Blob 생성 및 다운로드
      const blob = new Blob([stlData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}_${Date.now()}.stl`;
      a.click();

      // 메모리 정리
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('STL export failed:', error);
      alert('STL 내보내기 실패: ' + (error as Error).message);
    }
  };

  return (
    <div style={{
      padding: '20px',
      borderTop: '1px solid #ddd',
      backgroundColor: '#f8f9fa'
    }}>
      <button
        onClick={handleExportSTL}
        disabled={!selectedTemplate}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: selectedTemplate ? '#4CAF50' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedTemplate ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (selectedTemplate) {
            e.currentTarget.style.backgroundColor = '#45a049';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTemplate) {
            e.currentTarget.style.backgroundColor = '#4CAF50';
          }
        }}
      >
        📥 STL 다운로드
      </button>
    </div>
  );
};
