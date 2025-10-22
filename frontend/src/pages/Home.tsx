import { Scene3D } from '../components/Scene3D';
import type { Scene3DRef } from '../components/Scene3D';
import { SidePanel } from '../components/SidePanel';
import { useRef } from 'react';

export function Home() {
  const scene3DRef = useRef<Scene3DRef>(null);

  const handleExportSTL = async () => {
    // 백엔드를 통한 주문 생성
    await scene3DRef.current?.createOrderAndDownload();
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', margin: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <Scene3D ref={scene3DRef} />
      </div>
      <SidePanel onExportSTL={handleExportSTL} />
    </div>
  );
}
