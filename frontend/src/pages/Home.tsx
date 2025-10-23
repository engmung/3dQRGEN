import { Scene3D } from '../components/Scene3D';
import { ColorPalette } from '../components/ColorPalette';
import { EditPanel } from '../components/EditPanel';
import { AddPlateButton } from '../components/AddPlateButton';

export function Home() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 전체 화면 3D 씬 */}
      <div style={{ width: '100%', height: '100%' }}>
        <Scene3D />
      </div>

      {/* 상단 색상 팔레트 (선택된 판이 있을 때만 표시) */}
      <ColorPalette />

      {/* 우측 상단 추가 버튼 */}
      <AddPlateButton />

      {/* 우측 편집 패널 (선택된 판이 있을 때만 표시) */}
      <EditPanel />
    </div>
  );
}
