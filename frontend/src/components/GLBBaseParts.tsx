import { useEffect, useState, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { GLBRegions } from '../utils/glbLoader';
import { loadGLBRegions } from '../utils/glbLoader';

interface GLBBasePartsProps {
  plateColor: string;
  position?: [number, number, number];
  onRegionsLoaded?: (regions: GLBRegions) => void;
  onGltfsLoaded?: (gltfs: {
    back: any;
    brige: any;
    front: any;
    pin: any;
  }) => void;
}

export const GLBBaseParts = ({ plateColor, position, onRegionsLoaded, onGltfsLoaded }: GLBBasePartsProps) => {
  // 4개 파츠 로드 (원본)
  const backGltf = useLoader(GLTFLoader, '/models/BASE1_parts/back.glb');
  const brigeGltf = useLoader(GLTFLoader, '/models/BASE1_parts/brige.glb');
  const frontGltf = useLoader(GLTFLoader, '/models/BASE1_parts/front.glb');
  const pinGltf = useLoader(GLTFLoader, '/models/BASE1_parts/pin.glb');
  const [regionsExtracted, setRegionsExtracted] = useState(false);
  const [gltfsProvided, setGltfsProvided] = useState(false);

  // 각 인스턴스마다 clone된 scene 생성
  const backScene = useMemo(() => backGltf.scene.clone(), [backGltf]);
  const brigeScene = useMemo(() => brigeGltf.scene.clone(), [brigeGltf]);
  const frontScene = useMemo(() => frontGltf.scene.clone(), [frontGltf]);
  const pinScene = useMemo(() => pinGltf.scene.clone(), [pinGltf]);

  // front.glb에서 영역 데이터 추출
  useEffect(() => {
    if (regionsExtracted || !onRegionsLoaded) return;

    loadGLBRegions('/models/BASE1_parts/front.glb')
      .then((regions) => {
        onRegionsLoaded(regions);
        setRegionsExtracted(true);
      })
      .catch((error) => {
        console.error('Failed to load GLB regions from front.glb:', error);
      });
  }, [onRegionsLoaded, regionsExtracted]);

  // clone된 scene에 색상 및 그림자 설정 (각 인스턴스마다 독립적인 material)
  useEffect(() => {
    [backScene, brigeScene, frontScene, pinScene].forEach((scene) => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 새로운 material 인스턴스 생성 (clone 간 공유 방지)
          child.material = new THREE.MeshStandardMaterial({
            color: plateColor,
          });
          // 그림자 설정
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    });
  }, [backScene, brigeScene, frontScene, pinScene, plateColor]);

  // GLTF 데이터 상위로 전달 (OBJ export용)
  useEffect(() => {
    if (gltfsProvided || !onGltfsLoaded) return;

    onGltfsLoaded({
      back: backGltf,
      brige: brigeGltf,
      front: frontGltf,
      pin: pinGltf,
    });
    setGltfsProvided(true);
  }, [backGltf, brigeGltf, frontGltf, pinGltf, onGltfsLoaded, gltfsProvided]);

  return (
    <group position={position}>
      <primitive object={backScene} castShadow receiveShadow />
      <primitive object={brigeScene} castShadow receiveShadow />
      <primitive object={frontScene} castShadow receiveShadow />
      {/* PIN은 3D 미리보기에서 숨김 (OBJ export에서만 사용) */}
    </group>
  );
};
