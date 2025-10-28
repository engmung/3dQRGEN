import { useState, useEffect, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { QRPlateInstance } from "./QRPlateInstance";
import { GLBBaseParts } from "./GLBBaseParts";
import { useDesignStore } from "../store/useDesignStore";
import type { GLBRegions } from "../utils/glbLoader";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { applyMaterialToObject, disposeObject } from "../utils/materialFactory";
import { useIsMobile } from "../hooks/useMediaQuery";

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
      images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
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

/**
 * Phone model component (size reference)
 * Fixed hook violation by moving useLoader to top level
 */
const PhoneModel = () => {
  const phoneModel = useLoader(OBJLoader, "/models/Phone.obj");

  const processedPhoneModel = useMemo(() => {
    const cloned = phoneModel.clone();
    applyMaterialToObject(cloned, "#333333");
    cloned.scale.set(34, 34, 34);
    cloned.rotation.set(0.0, 1.18, 0.0);
    cloned.position.set(30, 3, -97);
    return cloned;
  }, [phoneModel]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      disposeObject(processedPhoneModel);
    };
  }, [processedPhoneModel]);

  return <primitive object={processedPhoneModel} />;
};

/**
 * Pin model component (preview only)
 * Fixed hook violation by moving useLoader to top level
 */
const PinModel = ({ color }: { color: string }) => {
  const pinGltf = useLoader(GLTFLoader, "/models/BASE1_parts/pin.glb");

  const processedPinModel = useMemo(() => {
    const cloned = pinGltf.scene.clone();
    applyMaterialToObject(cloned, color);
    cloned.scale.set(1, 1, 1);
    cloned.rotation.set(0, 0, 4.36);
    cloned.position.set(-0.8, 93.2, 0);
    return cloned;
  }, [pinGltf, color]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      disposeObject(processedPinModel);
    };
  }, [processedPinModel]);

  return <primitive object={processedPinModel} />;
};

export const Scene3D = ({
  onGltfsLoaded,
  onQRGeometriesReady,
}: Scene3DProps = {}) => {
  const plates = useDesignStore((state) => state.plates);
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const backgroundColor = useDesignStore((state) => state.backgroundColor);
  const isMobile = useIsMobile();

  const [glbRegions, setGlbRegions] = useState<GLBRegions | null>(null);

  // 카메라 위치 - PC와 모바일 다르게
  const cameraPos = isMobile
    ? { x: 340, y: 216, z: -147 }  // 모바일 초기 위치
    : { x: 220, y: 135, z: -117 };  // PC 초기 위치

  const cameraTarget = isMobile
    ? { x: 22.6, y: -3.5, z: -41.1 }  // 모바일 타겟
    : { x: 0, y: 50, z: 0 };  // PC 타겟

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
        <PhoneModel />

        {/* Pin 모델 (미리보기 전용) - 선택된 판이 있을 때만 표시 */}
        {selectedPlateId &&
          (() => {
            const selectedPlate = plates.find((p) => p.id === selectedPlateId);
            if (!selectedPlate) return null;

            return <PinModel color={selectedPlate.plateColor} />;
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
          target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </>
  );
};
