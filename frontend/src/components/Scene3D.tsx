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
      {/* 평면 바닥 (그리드) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* 그리드 헬퍼 */}
      <gridHelper args={[1000, 50, '#cccccc', '#e0e0e0']} position={[0, -4.9, 0]} />

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

      {/* 각 QR 판마다 GLB 파츠 모델과 QR 렌더링 */}
      {plates.map((plate, index) => (
        <group key={plate.id}>
          {/* GLB 파츠 모델 (각 판마다 clone된 인스턴스 렌더링) */}
          <GLBBaseParts
            plateColor={plate.plateColor}
            position={[plate.positionX, plate.positionY, plate.positionZ]}
            onRegionsLoaded={index === 0 ? (regions) => setGlbRegions(regions) : undefined}
            onGltfsLoaded={index === 0 ? onGltfsLoaded : undefined}
          />

          {/* QR 판 인스턴스 (glbRegions 로드 후에만 렌더링) */}
          {glbRegions && (
            <QRPlateInstance
              config={plate}
              isSelected={plate.id === selectedPlateId}
              qrRegion={glbRegions.QR}
              textRegion={glbRegions.TEXT}
              imageRegion={glbRegions.IMAGE}
              onGeometriesReady={onQRGeometriesReady ? (geometries) => onQRGeometriesReady(plate.id, geometries) : undefined}
            />
          )}
        </group>
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
