import * as THREE from 'three';

/**
 * STL 거치대의 중간 부분만 Z축 방향으로 연장
 *
 * @param geometry - 원본 BufferGeometry (STL에서 로드됨)
 * @param extensionAmount - 연장할 길이 (Three.js units)
 * @returns 수정된 새 BufferGeometry
 */
export function extendStandMiddle(
  geometry: THREE.BufferGeometry,
  extensionAmount: number
): THREE.BufferGeometry {
  // Geometry 복제 (원본 보존)
  const modifiedGeometry = geometry.clone();

  if (extensionAmount <= 0) {
    return modifiedGeometry;
  }

  const positions = modifiedGeometry.attributes.position;

  // Y축 범위 계산
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const rangeY = maxY - minY;

  // 중간 구간 정의 (Y축 25% ~ 75%)
  const extendStartY = minY + rangeY * 0.25;
  const extendEndY = minY + rangeY * 0.75;

  // 각 vertex의 Z 좌표 수정
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);

    // 중간 구간에 속하는 vertex만 연장
    if (y >= extendStartY && y <= extendEndY) {
      // 0 (시작) ~ 1 (끝) 범위로 정규화
      const t = (y - extendStartY) / (extendEndY - extendStartY);

      // Sine curve 보간 (부드러운 전환)
      // sin(t * π)는 0에서 시작해서 중간에 최대, 끝에서 다시 0
      const factor = Math.sin(t * Math.PI);

      // 현재 Z 좌표에 연장량 추가
      const currentZ = positions.getZ(i);
      positions.setZ(i, currentZ + extensionAmount * factor);
    }
  }

  // 수정 완료 표시
  positions.needsUpdate = true;

  // Normal 재계산 (조명 정상화)
  modifiedGeometry.computeVertexNormals();

  return modifiedGeometry;
}

/**
 * BufferGeometry의 Z축 범위 계산
 *
 * @param geometry - BufferGeometry
 * @returns { minZ, maxZ, depth }
 */
export function getGeometryDepth(geometry: THREE.BufferGeometry): {
  minZ: number;
  maxZ: number;
  depth: number;
} {
  const positions = geometry.attributes.position;

  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }

  return {
    minZ,
    maxZ,
    depth: maxZ - minZ,
  };
}
