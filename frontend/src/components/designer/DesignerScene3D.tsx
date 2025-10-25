import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDesignerStore } from '../../store/useDesignerStore';
import { geom3 } from '@jscad/modeling/src/geometries';

// JSCAD Geom3 → Three.js BufferGeometry 변환
function jscadToThree(geom: any): THREE.BufferGeometry {
  const polygons = geom3.toPolygons(geom);

  const vertices: number[] = [];
  const indices: number[] = [];

  let vertexIndex = 0;

  polygons.forEach((polygon: any) => {
    const baseIndex = vertexIndex;
    const polyVertices = polygon.vertices;

    // 모든 버텍스 추가
    polyVertices.forEach((vertex: number[]) => {
      vertices.push(vertex[0], vertex[1], vertex[2]);
      vertexIndex++;
    });

    // 삼각화 (fan triangulation)
    for (let i = 1; i < polyVertices.length - 1; i++) {
      indices.push(baseIndex, baseIndex + i, baseIndex + i + 1);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export const DesignerScene3D = () => {
  const { selectedTemplate, parameters } = useDesignerStore();
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!selectedTemplate) {
      setGeometry(null);
      return;
    }

    try {
      // JSCAD geometry 생성
      const jscadGeom = selectedTemplate.generate(parameters);
      // Three.js geometry로 변환
      const threeGeom = jscadToThree(jscadGeom);
      setGeometry(threeGeom);
    } catch (error) {
      console.error('Failed to generate geometry:', error);
    }
  }, [selectedTemplate, parameters]);

  return (
    <Canvas
      camera={{ position: [150, 150, 150], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#f0f0f0' }}
    >
      <OrbitControls />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* 바닥 그리드 */}
      <gridHelper args={[300, 30, '#999', '#ddd']} />

      {/* JSCAD 모델 렌더링 */}
      {geometry && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      )}
    </Canvas>
  );
};
