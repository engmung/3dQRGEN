import { TemplateSelector } from '../components/designer/TemplateSelector';
import { DesignerScene3D } from '../components/designer/DesignerScene3D';
import { ParameterPanel } from '../components/designer/ParameterPanel';
import { ExportButton } from '../components/designer/ExportButton';

export function Designer() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* 좌측: 템플릿 선택 */}
      <TemplateSelector />

      {/* 중앙: 3D 프리뷰 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <DesignerScene3D />
      </div>

      {/* 우측: 파라미터 패널 + Export */}
      <div style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ParameterPanel />
        </div>
        <ExportButton />
      </div>
    </div>
  );
}
