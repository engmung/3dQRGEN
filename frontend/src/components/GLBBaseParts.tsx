import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { GLBRegions } from '../utils/glbLoader';
import { loadGLBRegions } from '../utils/glbLoader';

interface GLBBasePartsProps {
  plateColor: string;
  onRegionsLoaded?: (regions: GLBRegions) => void;
  onGltfsLoaded?: (gltfs: { back: any; brige: any; front: any; pin: any }) => void;
}

export const GLBBaseParts = ({ plateColor, onRegionsLoaded, onGltfsLoaded }: GLBBasePartsProps) => {
  // 4개 파츠 로드
  const backGltf = useLoader(GLTFLoader, '/models/BASE1_parts/back.glb');
  const brigeGltf = useLoader(GLTFLoader, '/models/BASE1_parts/brige.glb');
  const frontGltf = useLoader(GLTFLoader, '/models/BASE1_parts/front.glb');
  const pinGltf = useLoader(GLTFLoader, '/models/BASE1_parts/pin.glb');
  const [regionsExtracted, setRegionsExtracted] = useState(false);
  const [gltfsProvided, setGltfsProvided] = useState(false);

  // front.glb에서 영역 데이터 추출
  useEffect(() => {
    if (regionsExtracted || !onRegionsLoaded) return;

    loadGLBRegions('/models/BASE1_parts/front.glb')
      .then((regions) => {
        console.log('GLB Regions extracted from front.glb:', regions);
        onRegionsLoaded(regions);
        setRegionsExtracted(true);
      })
      .catch((error) => {
        console.error('Failed to load GLB regions from front.glb:', error);
      });
  }, [onRegionsLoaded, regionsExtracted]);

  // 각 파츠에 사용자 선택 색상 적용 (vertex color 무시)
  // ⚠️ IMPORTANT: GLTF 전달 전에 먼저 실행되어야 함
  useEffect(() => {
    [backGltf, brigeGltf, frontGltf, pinGltf].forEach((gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 기존 material을 새로운 MeshStandardMaterial로 교체
          child.material = new THREE.MeshStandardMaterial({
            color: plateColor,
          });
        }
      });
    });
  }, [backGltf, brigeGltf, frontGltf, pinGltf, plateColor]);

  // GLTF 데이터 상위로 전달 (OBJ export용)
  useEffect(() => {
    if (gltfsProvided || !onGltfsLoaded) return;

    // console.log('[GLBBaseParts] Sending GLTFs to parent...');
    onGltfsLoaded({
      back: backGltf,
      brige: brigeGltf,
      front: frontGltf,
      pin: pinGltf,
    });
    setGltfsProvided(true);
  }, [backGltf, brigeGltf, frontGltf, pinGltf, onGltfsLoaded, gltfsProvided]);

  return (
    <group>
      <primitive object={backGltf.scene} castShadow receiveShadow />
      <primitive object={brigeGltf.scene} castShadow receiveShadow />
      <primitive object={frontGltf.scene} castShadow receiveShadow />
      {/* PIN은 3D 미리보기에서 숨김 (OBJ export에서만 사용) */}
    </group>
  );
};
