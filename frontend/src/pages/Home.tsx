import { useState, useMemo, useEffect } from 'react';
import { Scene3D } from '../components/Scene3D';
import { ColorPalette } from '../components/ColorPalette';
import { EditPanel } from '../components/EditPanel';
import { AddPlateButton } from '../components/AddPlateButton';
import { OBJPreviewContainer } from '../components/OBJPreviewScene';
import { OBJTransformPanel } from '../components/OBJTransformPanel';
import { exportCollectedMeshesToOBJ } from '../utils/objExporter';
import {
  collectGLBMeshes,
  collectQRGeometries,
  applyGlobalRotation,
  alignToGround,
} from '../utils/meshCollector';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { useDesignStore } from '../store/useDesignStore';
import * as THREE from 'three';

export function Home() {
  const [gltfs, setGltfs] = useState<{ back: any; brige: any; front: any; pin: any } | null>(null);
  const [showTransformPanel, setShowTransformPanel] = useState(false); // 기본값 false로 변경 (숨김)
  const [showOBJPreview, setShowOBJPreview] = useState(true); // OBJ Preview 표시 여부
  const [qrGeometries, setQrGeometries] = useState<{
    qr: THREE.BufferGeometry | null;
    text: THREE.BufferGeometry | null;
    image: THREE.BufferGeometry | null;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    textPosition: THREE.Vector3 | null;
    textQuaternion: THREE.Quaternion | null;
    imagePosition: THREE.Vector3 | null;
    imageQuaternion: THREE.Quaternion | null;
    qrColor: string;
  } | null>(null);

  // 디버깅: gltfs가 로드되면 로그 출력
  // useEffect(() => {
  //   if (gltfs) {
  //     console.log('[Home] GLTFs loaded successfully:', Object.keys(gltfs));
  //   }
  // }, [gltfs]);

  // OBJ Preview Store
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // 첫 번째 plate (단순화: 첫 번째 판만 사용)
  const plates = useDesignStore((state) => state.plates);
  const firstPlate = plates[0];

  // OBJ Export 핸들러
  const handleExportOBJ = () => {
    if (!gltfs) {
      alert('GLB 파츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      // 1. 메시 수집
      let allMeshes: any[] = [];

      allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', backTransform));
      allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', brigeTransform));
      allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', frontTransform));
      allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', pinTransform));

      // QR/텍스트/이미지 추가 (Front 파츠에 포함)
      if (qrGeometries) {
        allMeshes.push(
          ...collectQRGeometries(
            qrGeometries.qr,
            qrGeometries.text,
            qrGeometries.image,
            qrGeometries.qrPosition,
            qrGeometries.qrQuaternion,
            qrGeometries.textPosition,
            qrGeometries.textQuaternion,
            qrGeometries.imagePosition,
            qrGeometries.imageQuaternion,
            qrGeometries.qrColor,
            qrGeometries.zScale,
            frontTransform
          )
        );
      }

      // 2. Global rotation 적용
      allMeshes = applyGlobalRotation(allMeshes, globalRotation);

      // 3. 바닥면 정렬
      allMeshes = alignToGround(allMeshes);

      // 4. Export
      exportCollectedMeshesToOBJ(allMeshes, '3d_qr_export');

      console.log('OBJ export completed!');
    } catch (error) {
      console.error('OBJ export failed:', error);
      alert('OBJ export에 실패했습니다.');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex' }}>
      {/* 메인 씬 */}
      <div style={{ width: showOBJPreview ? '70%' : '100%', height: '100%', position: 'relative' }}>
        <Scene3D
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(geometries) => setQrGeometries(geometries)}
        />

        {/* 상단 색상 팔레트 (선택된 판이 있을 때만 표시) */}
        <ColorPalette />

        {/* 우측 상단 추가 버튼 */}
        <AddPlateButton />

        {/* 우측 편집 패널 (선택된 판이 있을 때만 표시) */}
        <EditPanel />

        {/* OBJ Preview 토글 버튼 */}
        <button
          onClick={() => setShowOBJPreview(!showOBJPreview)}
          style={{
            position: 'absolute',
            top: '20px',
            right: showOBJPreview ? 'calc(30% + 20px)' : '20px', // Preview 창 옆에 배치
            padding: '8px 16px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            zIndex: 100,
          }}
        >
          {showOBJPreview ? '🔧 Hide Preview' : '🔧 Show Preview'}
        </button>
      </div>

      {/* OBJ Preview 씬 (30%) */}
      {showOBJPreview && (
        <div style={{ width: '30%', height: '100%', borderLeft: '2px solid #333' }}>
          <OBJPreviewContainer gltfs={gltfs} qrGeometries={qrGeometries} />

          {/* Export 버튼 (Preview 창 하단) */}
          {gltfs && (
            <button
              onClick={handleExportOBJ}
              style={{
                position: 'absolute',
                bottom: showTransformPanel ? '52vh' : '20px',
                right: '20px',
                padding: '14px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 300,
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              💾 OBJ Export
            </button>
          )}
        </div>
      )}

      {/* Transform 컨트롤 패널 (하단) */}
      {showTransformPanel && <OBJTransformPanel />}

      {/* 패널 토글 버튼 - 주석 처리 (나중에 필요할 수 있음) */}
      {/* <button
        onClick={() => setShowTransformPanel(!showTransformPanel)}
        style={{
          position: 'fixed',
          bottom: showTransformPanel ? 'calc(50vh - 40px)' : '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px 4px 0 0',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 201,
        }}
      >
        {showTransformPanel ? '▼ Hide Controls' : '▲ Show Controls'}
      </button> */}
    </div>
  );
}
