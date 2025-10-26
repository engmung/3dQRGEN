import { useState, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { QRPlateInstance } from "./QRPlateInstance";
import { GLBBaseParts } from "./GLBBaseParts";
import { useDesignStore } from "../store/useDesignStore";
import type { GLBRegions } from "../utils/glbLoader";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Scene3DProps {
  onGltfsLoaded?: (gltfs: {
    back: any;
    brige: any;
    front: any;
    pin: any;
  }) => void;
  onQRGeometriesReady?: (
    plateId: string,
    geometries: {
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
    }
  ) => void;
}

export const Scene3D = ({
  onGltfsLoaded,
  onQRGeometriesReady,
}: Scene3DProps = {}) => {
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const backgroundColor = useDesignStore((state) => state.backgroundColor);

  const [glbRegions, setGlbRegions] = useState<GLBRegions | null>(null);

  // 카메라 위치 상태
  const cameraPos = { x: 150, y: 120, z: 150 };
  const targetY = 50;

  // 폰 모델 고정 값
  const phonePos = { x: 30, y: 3, z: -97 };
  const phoneRotation = { x: 0.0, y: 1.18, z: 0.0 };
  const phoneScale = 34;

  // Pin 모델 고정 값 (미리보기 전용)
  const pinPos = { x: -0.8, y: 93.2, z: 0 };
  const pinRotation = { x: 0, y: 0, z: 4.36 };
  const pinScale = 1;

  return (
    <>
      <Canvas
        camera={{ position: [cameraPos.x, cameraPos.y, cameraPos.z], fov: 50 }}
        shadows
        gl={{ antialias: true }}
        style={{ background: backgroundColor }}
      >
        {/* 조명 */}
        <ambientLight intensity={1.0} />
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

        {/* 바닥 실린더 */}
        <mesh position={[0, -5, 0]} rotation={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[200, 200, 10, 64]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* 폰 모델 (크기 비교용) */}
        <primitive
          object={(() => {
            const obj = useLoader(OBJLoader, "/models/Phone.obj");
            obj.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: "#333333",
                  metalness: 0.3,
                  roughness: 0.7,
                });
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            return obj;
          })()}
          position={[phonePos.x, phonePos.y, phonePos.z]}
          rotation={[phoneRotation.x, phoneRotation.y, phoneRotation.z]}
          scale={phoneScale}
        />

        {/* Pin 모델 (미리보기 전용) - 선택된 판이 있을 때만 표시 */}
        {selectedPlateId &&
          (() => {
            const selectedPlate = plates.find((p) => p.id === selectedPlateId);
            if (!selectedPlate) return null;

            return (
              <primitive
                object={(() => {
                  const gltf = useLoader(
                    GLTFLoader,
                    "/models/BASE1_parts/pin.glb"
                  );
                  gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                      child.material = new THREE.MeshStandardMaterial({
                        color: selectedPlate.plateColor,
                        metalness: 0.3,
                        roughness: 0.7,
                      });
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });
                  return gltf.scene;
                })()}
                position={[pinPos.x, pinPos.y, pinPos.z]}
                rotation={[pinRotation.x, pinRotation.y, pinRotation.z]}
                scale={pinScale}
              />
            );
          })()}

        {/* 선택된 QR 판만 중앙에 렌더링 */}
        {selectedPlateId &&
          (() => {
            const selectedPlate = plates.find((p) => p.id === selectedPlateId);
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
                    onGeometriesReady={
                      onQRGeometriesReady
                        ? (geometries) =>
                            onQRGeometriesReady(selectedPlate.id, geometries)
                        : undefined
                    }
                  />
                )}
              </group>
            );
          })()}

        {/* 컨트롤 */}
        <OrbitControls
          target={[0, targetY, 0]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </>
  );
};
