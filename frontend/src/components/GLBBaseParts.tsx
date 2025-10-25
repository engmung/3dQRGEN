import { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { GLBRegions } from '../utils/glbLoader';
import { loadGLBRegions } from '../utils/glbLoader';

interface GLBBasePartsProps {
  plateColor: string;
  onRegionsLoaded?: (regions: GLBRegions) => void;
}

export const GLBBaseParts = ({ plateColor, onRegionsLoaded }: GLBBasePartsProps) => {
  // 3개 파츠 로드
  const backGltf = useLoader(GLTFLoader, '/models/BASE1_parts/back.glb');
  const brigeGltf = useLoader(GLTFLoader, '/models/BASE1_parts/brige.glb');
  const frontGltf = useLoader(GLTFLoader, '/models/BASE1_parts/front.glb');
  const [regionsExtracted, setRegionsExtracted] = useState(false);

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
  useEffect(() => {
    [backGltf, brigeGltf, frontGltf].forEach((gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 기존 material을 새로운 MeshStandardMaterial로 교체
          child.material = new THREE.MeshStandardMaterial({
            color: plateColor,
          });
        }
      });
    });
  }, [backGltf, brigeGltf, frontGltf, plateColor]);

  return (
    <group>
      <primitive object={backGltf.scene} castShadow receiveShadow />
      <primitive object={brigeGltf.scene} castShadow receiveShadow />
      <primitive object={frontGltf.scene} castShadow receiveShadow />
    </group>
  );
};
