import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Region cache to avoid re-parsing GLB files
const regionCache = new Map<string, GLBRegions>();

export interface VertexGroup {
  vertices: THREE.Vector3[];      // 모든 vertex 위치
  center: THREE.Vector3;          // 중심점
  bbox: THREE.Box3;               // Bounding box
  normal: THREE.Vector3;          // 평균 법선 (평면 방향)
  upVector: THREE.Vector3;        // Up 벡터 (평면의 상단 방향)
  size: THREE.Vector3;            // 영역 크기 (width, height, depth)
  count: number;                  // vertex 개수
  topBoundary: number | null;     // 상단 경계 (upVector 방향 투영값)
  bottomBoundary: number | null;  // 하단 경계 (upVector 방향 투영값)
}

export interface GLBRegions {
  TEXT: VertexGroup | null;
  QR: VertexGroup | null;
  IMAGE: VertexGroup | null;
}

/**
 * Vertex group 데이터 추출 함수
 * @param positions - position attribute
 * @param normals - normal attribute
 * @param colors - color attribute (COLOR_0)
 * @param channelIndex - 채널 인덱스 (R=0, G=1, B=2)
 */
function extractVertexGroup(
  positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  normals: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  colors: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  channelIndex: number
): VertexGroup | null {
  const vertices: THREE.Vector3[] = [];
  const normalVectors: THREE.Vector3[] = [];
  const topBoundaryVertices: THREE.Vector3[] = [];
  const bottomBoundaryVertices: THREE.Vector3[] = [];

  // 루프 1: QR 영역 감지 (해당 채널 > 0.5)
  for (let i = 0; i < colors.count; i++) {
    // 해당 채널 확인 (R=0, G=1, B=2)
    let value: number;
    if (channelIndex === 0) value = colors.getX(i);
    else if (channelIndex === 1) value = colors.getY(i);
    else if (channelIndex === 2) value = colors.getZ(i);
    else continue;

    if (value > 0.5) {
      // 위치 추출
      const vertex = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      vertices.push(vertex);

      // 법선 추출
      normalVectors.push(
        new THREE.Vector3(
          normals.getX(i),
          normals.getY(i),
          normals.getZ(i)
        )
      );
    }
  }

  // 루프 2: 경계 감지 (전체 버텍스에서 Alpha 확인)
  for (let i = 0; i < colors.count; i++) {
    const alpha = colors.getW(i);

    if (Math.abs(alpha - 0.9) < 0.05) {
      // 상단 경계
      topBoundaryVertices.push(
        new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        )
      );
    } else if (Math.abs(alpha - 0.1) < 0.05) {
      // 하단 경계
      bottomBoundaryVertices.push(
        new THREE.Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        )
      );
    }
  }

  if (vertices.length === 0) {
    return null;
  }

  // 중심점 계산
  const center = new THREE.Vector3();
  vertices.forEach((v) => center.add(v));
  center.divideScalar(vertices.length);

  // Bounding Box 계산
  const bbox = new THREE.Box3().setFromPoints(vertices);

  // 평균 법선 벡터 (평면의 기울기)
  const avgNormal = new THREE.Vector3();
  normalVectors.forEach((n) => avgNormal.add(n));
  avgNormal.normalize();

  // Up 벡터 계산 (4개 버텍스가 사각형을 이룬다고 가정)
  // 좌하단, 우하단 찾기 (Y가 가장 작은 2개)
  const sortedByY = [...vertices].sort((a, b) => a.y - b.y);
  const bottom1 = sortedByY[0];
  const bottom2 = sortedByY[1];

  // 좌상단, 우상단 찾기 (Y가 가장 큰 2개)
  const top1 = sortedByY[sortedByY.length - 2];
  const top2 = sortedByY[sortedByY.length - 1];

  // 하단 중심과 상단 중심 계산
  const bottomCenter = new THREE.Vector3().addVectors(bottom1, bottom2).multiplyScalar(0.5);
  const topCenter = new THREE.Vector3().addVectors(top1, top2).multiplyScalar(0.5);

  // Up 벡터 = 하단 중심 → 상단 중심
  const upVector = new THREE.Vector3().subVectors(topCenter, bottomCenter).normalize();

  // 크기 계산
  const size = new THREE.Vector3();
  bbox.getSize(size);

  // 경계값 계산 (중심에서 upVector 방향으로 투영)
  let topBoundary: number | null = null;
  let bottomBoundary: number | null = null;

  if (topBoundaryVertices.length > 0) {
    topBoundary = Math.max(
      ...topBoundaryVertices.map(v =>
        new THREE.Vector3().subVectors(v, center).dot(upVector)
      )
    );
  }

  if (bottomBoundaryVertices.length > 0) {
    bottomBoundary = Math.min(
      ...bottomBoundaryVertices.map(v =>
        new THREE.Vector3().subVectors(v, center).dot(upVector)
      )
    );
  }

  return {
    vertices,
    center,
    bbox,
    normal: avgNormal,
    upVector,
    size,
    count: vertices.length,
    topBoundary,
    bottomBoundary,
  };
}

/**
 * GLB 파일을 로드하고 COLOR_0 attribute로 정의된 영역들을 추출
 * @param glbPath - GLB 파일 경로
 * @returns Promise<GLBRegions>
 */
export function loadGLBRegions(glbPath: string): Promise<GLBRegions> {
  // Check cache first
  if (regionCache.has(glbPath)) {
    if (import.meta.env.DEV) {
      console.log(`✅ [GLB Cache] Using cached regions for ${glbPath}`);
    }
    return Promise.resolve(regionCache.get(glbPath)!);
  }

  if (import.meta.env.DEV) {
    console.log(`📦 [GLB Load] Loading regions from ${glbPath}`);
  }

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      glbPath,
      (gltf) => {
        // 첫 번째 mesh 가져오기
        let mesh: THREE.Mesh | null = null;

        // 모든 children 중에서 Mesh 찾기
        for (const child of gltf.scene.children) {
          if (child instanceof THREE.Mesh) {
            mesh = child;
            break;
          }
        }

        if (!mesh || !mesh.geometry) {
          reject(new Error('No mesh found in GLB file'));
          return;
        }

        const geometry = mesh.geometry;

        // Attributes 가져오기
        const positions = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const colors = geometry.attributes.color; // COLOR_0

        if (!colors) {
          console.error('Available attributes:', Object.keys(geometry.attributes));
          console.error('Geometry:', geometry);
          reject(new Error(`No COLOR_0 attribute found in GLB. Available: ${Object.keys(geometry.attributes).join(', ')}`));
          return;
        }


        // 각 그룹별 데이터 추출
        const regions: GLBRegions = {
          TEXT: extractVertexGroup(positions, normals, colors, 0), // R channel
          QR: extractVertexGroup(positions, normals, colors, 1),   // G channel
          IMAGE: extractVertexGroup(positions, normals, colors, 2), // B channel
        };

        // Cache before returning
        regionCache.set(glbPath, regions);

        if (import.meta.env.DEV) {
          console.log(`💾 [GLB Cache] Cached regions for ${glbPath}`);
        }

        resolve(regions);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
