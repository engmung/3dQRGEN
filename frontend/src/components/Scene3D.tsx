import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { QRPlateInstance } from './QRPlateInstance';
import { GLBBaseParts } from './GLBBaseParts';
import { useDesignStore } from '../store/useDesignStore';
import type { GLBRegions } from '../utils/glbLoader';
import * as THREE from 'three';

interface Scene3DProps {
  onGltfsLoaded?: (gltfs: {
    back: any;
    brige: any;
    front: any;
    pin: any;
  }) => void;
  onQRGeometriesReady?: (plateId: string, geometries: {
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

      {/* 선택된 QR 판만 중앙에 렌더링 */}
      {selectedPlateId && (() => {
        const selectedPlate = plates.find(p => p.id === selectedPlateId);
        if (!selectedPlate) return null;

        return (
          <group key={selectedPlate.id}>
            {/* GLB 파츠 모델 (중앙 위치 고정) */}
            <GLBBaseParts
              plateColor={selectedPlate.plateColor}
              position={[0, 0, 0]}
              onRegionsLoaded={(regions) => setGlbRegions(regions)}
              onGltfsLoaded={onGltfsLoaded}
            />

            {/* QR 판 인스턴스 (glbRegions 로드 후에만 렌더링) */}
            {glbRegions && (
              <QRPlateInstance
                config={selectedPlate}
                isSelected={true}
                qrRegion={glbRegions.QR}
                textRegion={glbRegions.TEXT}
                imageRegion={glbRegions.IMAGE}
                onGeometriesReady={onQRGeometriesReady ? (geometries) => onQRGeometriesReady(selectedPlate.id, geometries) : undefined}
              />
            )}
          </group>
        );
      })()}

      {/* 컨트롤 (회전만 가능) */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}  // 줌 비활성화
        enablePan={false}   // 팬 비활성화
        // 회전만 가능
      />
    </Canvas>
  );
};
