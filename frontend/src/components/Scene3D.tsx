import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { QRPlateInstance } from './QRPlateInstance';
import { useDesignStore } from '../store/useDesignStore';

export const Scene3D = () => {
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectPlate = useDesignStore((state) => state.selectPlate);

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

      {/* 여러 QR 판 렌더링 */}
      {plates.map(plate => (
        <QRPlateInstance
          key={plate.id}
          config={plate}
          isSelected={plate.id === selectedPlateId}
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
