import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { useDesignStore } from '../store/useDesignStore';
import {
  collectGLBMeshes,
  collectQRGeometries,
  collectBusinessCardMeshes,
  applyGlobalRotation,
  alignToGround,
  type CollectedMesh,
} from '../utils/meshCollector';

interface OBJPreviewSceneProps {
  gltfs: {
    back: any;
    brige: any;
    front: any;
    pin: any;
  } | null;
  plateColor?: string; // 판 색상 (선택된 plate의 색상)
  qrGeometries?: {
    qr: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    qrColor: string;
    zScale: number;
  } | null;
}

export const OBJPreviewScene = ({ gltfs, plateColor, qrGeometries }: OBJPreviewSceneProps) => {
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // 선택된 plate 가져오기 (productType 확인용)
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const selectedPlate = plates.find(p => p.id === selectedPlateId) || plates[0];

  // 모든 메시 수집 및 변환
  const previewMeshes = useMemo(() => {
    if (!selectedPlate) return [];

    let allMeshes: CollectedMesh[] = [];

    if (selectedPlate.productType === 'card') {
      // 명함 모드: GLB 파츠 불필요, 이미 회전되어 있으므로 그대로 바닥에만 붙임
      if (qrGeometries) {
        // 명함은 이미 BusinessCard.tsx에서 회전되어 있으므로 빈 transform 전달
        const emptyTransform = {
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };

        allMeshes.push(
          ...collectBusinessCardMeshes(
            selectedPlate.cardWidth,
            selectedPlate.cardHeight,
            selectedPlate.cardThickness,
            selectedPlate.plateColor,
            qrGeometries.qr,
            qrGeometries.texts || [],
            qrGeometries.images,
            qrGeometries.qrPosition,
            qrGeometries.qrQuaternion,
            qrGeometries.qrColor,
            qrGeometries.zScale,
            selectedPlate.cardCornerStyle ?? 'sharp',
            selectedPlate.cardCornerRadius ?? 2,
            emptyTransform
          )
        );
      }

      // 명함은 바닥면 정렬만 수행 (회전 이미 적용됨)
      allMeshes = alignToGround(allMeshes);
    } else {
      // 거치대 모드: GLB 파츠 필요
      if (!gltfs) return [];

      // 1. GLB 파츠 수집 (plateColor 적용)
      allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', backTransform, plateColor, true));
      allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', brigeTransform, plateColor));
      allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', frontTransform, plateColor));
      allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', pinTransform, plateColor));

      // 2. QR/텍스트/이미지 수집 (Front 파츠에 포함)
      if (qrGeometries) {
        allMeshes.push(
          ...collectQRGeometries(
            qrGeometries.qr,
            qrGeometries.texts || [],
            qrGeometries.images,
            qrGeometries.qrPosition,
            qrGeometries.qrQuaternion,
            qrGeometries.qrColor,
            qrGeometries.zScale,
            frontTransform
          )
        );
      }

      // 거치대는 Global rotation 적용 후 바닥면 정렬
      allMeshes = applyGlobalRotation(allMeshes, globalRotation);
      allMeshes = alignToGround(allMeshes);
    }

    return allMeshes;
  }, [
    selectedPlate,
    gltfs,
    plateColor,
    qrGeometries?.qr,
    qrGeometries?.texts,
    qrGeometries?.images,
    qrGeometries?.qrPosition,
    qrGeometries?.qrQuaternion,
    qrGeometries?.qrColor,
    qrGeometries?.zScale,
    backTransform,
    brigeTransform,
    frontTransform,
    pinTransform,
    globalRotation,
  ]);

  // 명함 모드일 때는 GLB 체크 건너뛰기
  if (selectedPlate?.productType === 'stand' && !gltfs) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2a2a2a',
          color: '#888',
        }}
      >
        GLB 파츠 로딩 중...
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [150, 100, 150], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: '#2a2a2a' }}
    >
      {/* 조명 */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[50, 50, 50]} intensity={1.5} />
      <directionalLight position={[-50, -50, -50]} intensity={0.8} />

      {/* 바닥 그리드 (참고용) */}
      <gridHelper args={[200, 20, '#444', '#333']} position={[0, 0, 0]} />

      {/* Preview 메시들 */}
      {previewMeshes.map((mesh, index) => (
        <mesh key={index} geometry={mesh.geometry} material={mesh.material} />
      ))}

      {/* 컨트롤 */}
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
};

/**
 * Preview 씬 컨테이너 (타이틀 포함)
 */
export const OBJPreviewContainer = ({
  gltfs,
  plateColor,
  qrGeometries,
}: OBJPreviewSceneProps) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 타이틀 */}
      <div
        style={{
          padding: '10px 15px',
          background: '#1a1a1a',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '14px',
          borderBottom: '1px solid #444',
        }}
      >
        🔧 OBJ Export Preview (실시간)
      </div>

      {/* 씬 */}
      <div style={{ flex: 1 }}>
        <OBJPreviewScene gltfs={gltfs} plateColor={plateColor} qrGeometries={qrGeometries} />
      </div>
    </div>
  );
};
