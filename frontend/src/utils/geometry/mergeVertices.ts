/**
 * Merge by Distance (중복 버텍스 병합)
 * Blender의 Merge by Distance 기능과 동일
 */

import * as THREE from 'three';

interface VertexData {
  position: THREE.Vector3;
  normal?: THREE.Vector3;
  indices: number[]; // 원본 인덱스들
}

/**
 * 중복 버텍스를 병합하여 최적화된 geometry 반환
 * @param geometry - 원본 BufferGeometry
 * @param tolerance - 병합 거리 허용치 (기본값: 0.0001)
 * @returns 병합된 BufferGeometry
 */
export function mergeVertices(
  geometry: THREE.BufferGeometry,
  tolerance: number = 0.0001
): THREE.BufferGeometry {
  const positionAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;

  if (!positionAttr) {
    console.warn('[mergeVertices] No position attribute found');
    return geometry.clone();
  }

  // 1. indexed geometry가 아니면 먼저 indexed로 변환
  let indices: number[];
  if (geometry.index) {
    indices = Array.from(geometry.index.array);
  } else {
    // Non-indexed -> indexed
    indices = [];
    for (let i = 0; i < positionAttr.count; i++) {
      indices.push(i);
    }
  }

  // 2. 고유 버텍스 수집 (위치 기반 해싱)
  const vertexMap = new Map<string, VertexData>();
  const toleranceInv = 1 / tolerance;

  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);

    // 위치를 tolerance 단위로 반올림하여 해시 키 생성
    const hashX = Math.round(x * toleranceInv);
    const hashY = Math.round(y * toleranceInv);
    const hashZ = Math.round(z * toleranceInv);
    const key = `${hashX}_${hashY}_${hashZ}`;

    if (vertexMap.has(key)) {
      // 기존 버텍스에 인덱스 추가
      vertexMap.get(key)!.indices.push(i);
    } else {
      // 새 버텍스 추가
      const normal = normalAttr
        ? new THREE.Vector3(
            normalAttr.getX(i),
            normalAttr.getY(i),
            normalAttr.getZ(i)
          )
        : undefined;

      vertexMap.set(key, {
        position: new THREE.Vector3(x, y, z),
        normal,
        indices: [i],
      });
    }
  }

  // 3. 새 버텍스 배열 생성
  const newPositions: number[] = [];
  const newNormals: number[] = [];
  const oldToNewIndex = new Map<number, number>();

  let newIndex = 0;
  vertexMap.forEach((vertexData) => {
    // 위치 추가
    newPositions.push(
      vertexData.position.x,
      vertexData.position.y,
      vertexData.position.z
    );

    // 노말 추가 (있으면)
    if (vertexData.normal) {
      newNormals.push(
        vertexData.normal.x,
        vertexData.normal.y,
        vertexData.normal.z
      );
    }

    // 이전 인덱스 -> 새 인덱스 매핑
    vertexData.indices.forEach((oldIdx) => {
      oldToNewIndex.set(oldIdx, newIndex);
    });

    newIndex++;
  });

  // 4. 새 인덱스 배열 생성
  const newIndices: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    const oldIdx = indices[i];
    const mappedIdx = oldToNewIndex.get(oldIdx);
    if (mappedIdx !== undefined) {
      newIndices.push(mappedIdx);
    }
  }

  // 5. 새 geometry 생성
  const newGeometry = new THREE.BufferGeometry();
  newGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(newPositions, 3)
  );

  if (newNormals.length > 0) {
    newGeometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(newNormals, 3)
    );
  }

  newGeometry.setIndex(newIndices);

  // 노말이 없으면 자동 계산
  if (newNormals.length === 0) {
    newGeometry.computeVertexNormals();
  }

  return newGeometry;
}

/**
 * 여러 geometry를 하나로 병합 후 중복 버텍스 제거
 * @param geometries - BufferGeometry 배열
 * @param tolerance - 병합 거리 허용치
 * @returns 병합된 BufferGeometry
 */
export function mergeGeometries(
  geometries: THREE.BufferGeometry[],
  tolerance: number = 0.0001
): THREE.BufferGeometry {
  if (geometries.length === 0) {
    return new THREE.BufferGeometry();
  }

  if (geometries.length === 1) {
    return mergeVertices(geometries[0], tolerance);
  }

  // BufferGeometryUtils.mergeBufferGeometries 대체 구현
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  geometries.forEach((geo) => {
    const posAttr = geo.attributes.position;
    const normAttr = geo.attributes.normal;

    if (!posAttr) return;

    // 위치 복사
    for (let i = 0; i < posAttr.count; i++) {
      positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }

    // 노말 복사 (있으면)
    if (normAttr) {
      for (let i = 0; i < normAttr.count; i++) {
        normals.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
      }
    }

    // 인덱스 복사
    if (geo.index) {
      for (let i = 0; i < geo.index.count; i++) {
        indices.push(geo.index.getX(i) + vertexOffset);
      }
    } else {
      for (let i = 0; i < posAttr.count; i++) {
        indices.push(i + vertexOffset);
      }
    }

    vertexOffset += posAttr.count;
  });

  const mergedGeo = new THREE.BufferGeometry();
  mergedGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  if (normals.length > 0) {
    mergedGeo.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(normals, 3)
    );
  }

  mergedGeo.setIndex(indices);

  return mergeVertices(mergedGeo, tolerance);
}
