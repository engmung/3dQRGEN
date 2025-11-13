/**
 * 명함 Geometry 생성 유틸리티
 *
 * 모서리 스타일에 따라 적절한 Geometry를 생성합니다:
 * - sharp: 일반 BoxGeometry (뾰족한 모서리)
 * - rounded: RoundedBoxGeometry (둥근 모서리, segments = 4)
 * - chamfered: RoundedBoxGeometry (45도 챔퍼, segments = 1)
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CardCornerStyle } from '../../types/design';

/**
 * 명함 Geometry 생성
 * @param width - 가로 (mm)
 * @param height - 세로 (mm)
 * @param thickness - 두께 (mm)
 * @param cornerStyle - 모서리 스타일 ('sharp', 'rounded', 'chamfered')
 * @param cornerRadius - 둥글게/챔퍼 크기 (mm)
 * @returns BufferGeometry
 */
export function createCardGeometry(
  width: number,
  height: number,
  thickness: number,
  cornerStyle: CardCornerStyle,
  cornerRadius: number
): THREE.BufferGeometry {
  // 뾰족한 모서리: 일반 BoxGeometry
  if (cornerStyle === 'sharp') {
    return new THREE.BoxGeometry(width, height, thickness);
  }

  // 둥근 모서리: segments = 4 (부드러운 곡선)
  // 45도 챔퍼: segments = 1 (직선 챔퍼)
  const segments = cornerStyle === 'chamfered' ? 1 : 4;

  // RoundedBoxGeometry(width, height, depth, segments, radius)
  return new RoundedBoxGeometry(width, height, thickness, segments, cornerRadius);
}
