import { useState } from 'react';
import { Scene3D } from '../components/Scene3D';
import { ColorPalette } from '../components/color/ColorPalette';
import { EditPanel } from '../components/EditPanel';
import { AddPlateButton } from '../components/AddPlateButton';
import { OBJPreviewContainer } from '../components/OBJPreviewScene';
import { OBJTransformPanel } from '../components/OBJTransformPanel';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { useDesignStore } from '../store/useDesignStore';
import { useOBJExport } from '../hooks/useOBJExport';
import * as THREE from 'three';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

interface HomeDebugProps {
  onLoadingComplete?: () => void;
}

export function HomeDebug({ onLoadingComplete }: HomeDebugProps = {}) {
  const [gltfs, setGltfs] = useState<{
    back: any;
    brige: any;
    front: any;
    pin: any;
  } | null>(null);
  const [showTransformPanel, setShowTransformPanel] = useState(DEV_MODE); // 환경변수로 제어
  const [showOBJPreview, setShowOBJPreview] = useState(false); // OBJ Preview 표시 여부 (기본값: false)
  const [qrGeometriesMap, setQrGeometriesMap] = useState<Map<string, {
    qr: THREE.BufferGeometry | null;
    text: THREE.BufferGeometry | null;
    image: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    textPosition: THREE.Vector3 | null;
    textQuaternion: THREE.Quaternion | null;
    imagePosition: THREE.Vector3 | null;
    imageQuaternion: THREE.Quaternion | null;
    qrColor: string;
    zScale: number;
  }>>(new Map());

  // OBJ Preview Store
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // Plates 가져오기
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectedPlate = plates.find(p => p.id === selectedPlateId) || plates[0];

  // 선택된 plate의 geometries
  const selectedQrGeometries = selectedPlate ? qrGeometriesMap.get(selectedPlate.id) : null;

  // OBJ Export 훅 사용
  const { exportSinglePlate, exportAllPlates } = useOBJExport({
    gltfs,
    objTransforms: {
      backTransform,
      brigeTransform,
      frontTransform,
      pinTransform,
      globalRotation,
    },
  });

  // 현재 선택된 plate만 Export
  const handleExportOBJ = () => {
    if (!selectedPlate) {
      alert('선택된 판이 없습니다.');
      return;
    }

    const plateIndex = plates.findIndex(p => p.id === selectedPlate.id) + 1;
    exportSinglePlate(selectedPlate, selectedQrGeometries ?? undefined, plateIndex);
  };

  // 모든 plate를 개별 파일로 Export
  const handleExportAllPlates = () => {
    exportAllPlates(plates, qrGeometriesMap);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex' }}>
      {/* 메인 씬 */}
      <div style={{ width: showOBJPreview ? '70%' : '100%', height: '100%', position: 'relative' }}>
        <Scene3D
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(plateId, geometries) => {
            setQrGeometriesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(plateId, geometries);
              return newMap;
            });
          }}
          onLoadingComplete={onLoadingComplete}
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
          <OBJPreviewContainer
            gltfs={gltfs}
            plateColor={selectedPlate?.plateColor}
            qrGeometries={selectedQrGeometries ?? null}
          />

          {/* Export 버튼들 (Preview 창 하단) */}
          {(selectedPlate?.productType === 'card' || gltfs) && (
            <>
              {/* 선택된 판 Export */}
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

              {/* 모든 판 Export (2개 이상일 때만 표시) */}
              {plates.length > 1 && (
                <button
                  onClick={handleExportAllPlates}
                  style={{
                    position: 'absolute',
                    bottom: showTransformPanel ? '52vh' : '70px',
                    right: '20px',
                    padding: '10px 18px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 300,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0b7dda')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
                >
                  📦 Export All ({plates.length})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Transform 컨트롤 패널 (하단) */}
      {DEV_MODE && showTransformPanel && <OBJTransformPanel />}
    </div>
  );
}
