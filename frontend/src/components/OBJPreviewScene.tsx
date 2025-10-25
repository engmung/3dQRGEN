import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { useDesignStore } from '../store/useDesignStore';
import {
  collectGLBMeshes,
  collectQRGeometries,
  applyGlobalRotation,
  alignToGround,
  type CollectedMesh,
} from '../utils/meshCollector';

interface OBJPreviewSceneProps {
  gltfs: { back: any; brige: any; front: any; pin: any } | null;
  qrGeometries?: {
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
    zScale: number;
  } | null;
}

export const OBJPreviewScene = ({ gltfs, qrGeometries }: OBJPreviewSceneProps) => {
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // 모든 메시 수집 및 변환
  const previewMeshes = useMemo(() => {
    if (!gltfs) return [];

    let allMeshes: CollectedMesh[] = [];

    // 1. GLB 파츠 수집
    allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', backTransform));
    allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', brigeTransform));
    allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', frontTransform));
    allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', pinTransform));

    // 2. QR/텍스트/이미지 수집 (Front 파츠에 포함)
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

    // 3. Global rotation 적용 (눕히기)
    allMeshes = applyGlobalRotation(allMeshes, globalRotation);

    // 4. 바닥면 정렬
    allMeshes = alignToGround(allMeshes);

    return allMeshes;
  }, [
    gltfs,
    qrGeometries?.qr,
    qrGeometries?.text,
    qrGeometries?.image,
    qrGeometries?.qrPosition,
    qrGeometries?.qrQuaternion,
    qrGeometries?.textPosition,
    qrGeometries?.textQuaternion,
    qrGeometries?.imagePosition,
    qrGeometries?.imageQuaternion,
    qrGeometries?.qrColor,
    qrGeometries?.zScale,
    backTransform,
    brigeTransform,
    frontTransform,
    pinTransform,
    globalRotation,
  ]);

  if (!gltfs) {
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
        <OBJPreviewScene gltfs={gltfs} qrGeometries={qrGeometries} />
      </div>
    </div>
  );
};
