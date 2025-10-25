/**
 * Polygon helper functions for contour processing
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * 2D 윤곽선의 signed area 계산 (Shoelace formula)
 * @returns 양수: 시계 반대 방향(CCW), 음수: 시계 방향(CW)
 */
export function getSignedArea(contour: number[][]): number {
  let area = 0;
  const n = contour.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += contour[i][0] * contour[j][1];
    area -= contour[j][0] * contour[i][1];
  }

  return area / 2;
}

/**
 * 윤곽선이 반시계 방향(CCW)인지 확인
 */
export function isCCW(contour: number[][]): boolean {
  return getSignedArea(contour) > 0;
}

/**
 * 윤곽선을 반시계 방향(CCW)으로 정규화
 * THREE.js는 외곽선과 홀 모두 CCW를 기대
 */
export function ensureCCW(contour: number[][]): number[][] {
  if (isCCW(contour)) {
    return contour;
  } else {
    // CW인 경우 순서 반전
    return [...contour].reverse();
  }
}

/**
 * Point-in-polygon 테스트 (Ray casting algorithm)
 * @returns true if point is inside polygon
 */
export function isPointInPolygon(point: number[], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * 윤곽선의 중첩 레벨 계산 (Even-Odd Rule용)
 * @param contourIndex - 체크할 윤곽선 인덱스
 * @param allContours - 모든 윤곽선 배열
 * @returns 중첩 레벨 (0 = 최외곽, 1 = 홀, 2 = 홀 안의 도형, ...)
 */
export function calculateNestingLevel(contourIndex: number, allContours: number[][][]): number {
  const targetContour = allContours[contourIndex];
  const testPoint = targetContour[0]; // 첫 번째 점으로 테스트

  let nestingLevel = 0;

  // 다른 모든 윤곽선에 대해 포함 여부 체크
  for (let i = 0; i < allContours.length; i++) {
    if (i === contourIndex) continue; // 자기 자신 제외

    const otherContour = allContours[i];
    if (isPointInPolygon(testPoint, otherContour)) {
      nestingLevel++;
    }
  }

  return nestingLevel;
}

/**
 * 홀의 직접 부모 윤곽선 찾기
 * @param holeIndex - 홀 윤곽선 인덱스
 * @param allContours - 모든 윤곽선 배열
 * @param nestingLevels - 각 윤곽선의 nesting level 배열
 * @returns 부모 윤곽선 인덱스 (없으면 -1)
 */
export function findDirectParent(
  holeIndex: number,
  allContours: number[][][],
  nestingLevels: number[]
): number {
  const holeContour = allContours[holeIndex];
  const holeLevel = nestingLevels[holeIndex];
  const testPoint = holeContour[0];

  // 부모는 레벨이 정확히 1 작아야 함 (홀수 → 짝수)
  const parentLevel = holeLevel - 1;

  let smallestParent = -1;
  let smallestParentArea = Infinity;

  // 모든 후보 부모 중 가장 작은(직접 부모) 것 찾기
  for (let i = 0; i < allContours.length; i++) {
    if (i === holeIndex) continue;
    if (nestingLevels[i] !== parentLevel) continue; // 레벨이 정확히 1 작아야 함

    const candidateContour = allContours[i];

    // 홀이 후보 부모 안에 있는지 확인
    if (isPointInPolygon(testPoint, candidateContour)) {
      const candidateArea = Math.abs(getSignedArea(candidateContour));

      // 가장 작은 부모 = 직접 부모
      if (candidateArea < smallestParentArea) {
        smallestParentArea = candidateArea;
        smallestParent = i;
      }
    }
  }

  return smallestParent;
}
