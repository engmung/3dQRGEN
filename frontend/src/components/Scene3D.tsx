import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { QRPlateInstance } from './QRPlateInstance';
import { GLBBaseParts } from './GLBBaseParts';
import { useDesignStore } from '../store/useDesignStore';
import type { GLBRegions } from '../utils/glbLoader';
import * as THREE from 'three';

interface Scene3DProps {
  onGltfsLoaded?: (gltfs: { back: any; brige: any; front: any; pin: any }) => void;
  onQRGeometriesReady?: (geometries: {
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
  }) => void;
}

export const Scene3D = ({ onGltfsLoaded, onQRGeometriesReady }: Scene3DProps = {}) => {
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);

  const [glbRegions, setGlbRegions] = useState<GLBRegions | null>(null);

  return (
    <Canvas
      camera={{ position: [200, 150, 200], fov: 50 }}
      shadows
      gl={{ antialias: true }}
      onPointerMissed={() => selectPlate(null)} // 빈 공간 클릭 시 선택 해제
    >
      {/* 조명 */}
      <ambientLight intensity={2.0} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <directionalLight position={[-100, -100, -50]} intensity={1.2} />
      <directionalLight position={[0, 200, 0]} intensity={1.0} />

      {/* GLB 파츠 모델 - 영역 추출 + 렌더링 */}
      {plates.length > 0 && (
        <GLBBaseParts
          plateColor={plates[0].plateColor}
          onRegionsLoaded={(regions) => setGlbRegions(regions)}
          onGltfsLoaded={onGltfsLoaded}
        />
      )}

      {/* 여러 QR 판 렌더링 */}
      {glbRegions && plates.map((plate, index) => (
        <QRPlateInstance
          key={plate.id}
          config={plate}
          isSelected={plate.id === selectedPlateId}
          qrRegion={glbRegions.QR}
          textRegion={glbRegions.TEXT}
          imageRegion={glbRegions.IMAGE}
          onGeometriesReady={index === 0 ? onQRGeometriesReady : undefined}
        />
      ))}

      {/* 컨트롤 */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={50}
        maxDistance={500}
      />
    </Canvas>
  );
};
