import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { QRPlate } from './QRPlate';
import type { QRPlateRef } from './QRPlate';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface Scene3DRef {
  exportOBJ: () => void;
  createOrderAndDownload: (onReady: (plateObjBlob: Blob, plateMtlBlob: Blob, standObjBlob: Blob, standMtlBlob: Blob, price: number) => void) => void;
}

export const Scene3D = forwardRef<Scene3DRef>((props, ref) => {
  const qrPlateRef = useRef<QRPlateRef>(null);

  useImperativeHandle(ref, () => ({
    exportOBJ: () => {
      qrPlateRef.current?.exportOBJ();
    },
    createOrderAndDownload: (onReady: (plateObjBlob: Blob, plateMtlBlob: Blob, standObjBlob: Blob, standMtlBlob: Blob, price: number) => void) => {
      qrPlateRef.current?.createOrderAndDownload(onReady);
    }
  }));

  return (
    <Canvas camera={{ position: [200, 150, 200], fov: 50 }} shadows gl={{ antialias: true }}>
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

      {/* QR 판 */}
      <QRPlate ref={qrPlateRef} />

      {/* 컨트롤 */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={50}
        maxDistance={500}
      />
    </Canvas>
  );
});
