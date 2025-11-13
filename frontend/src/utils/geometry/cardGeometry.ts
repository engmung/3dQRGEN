/**
 * 명함 Geometry 생성 유틸리티
 *
 * 모서리 스타일에 따라 적절한 Geometry를 생성합니다:
 * - sharp: 일반 BoxGeometry (뾰족한 모서리)
 * - rounded: ExtrudeGeometry + rounded shape (둥근 모서리)
 * - chamfered: ExtrudeGeometry + chamfered shape (45도 챔퍼)
 */

import * as THREE from 'three';
import type { CardCornerStyle } from '../../types/design';

/**
 * 둥근 모서리 2D 형태 생성
 */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return shape;
}

/**
 * 45도 챔퍼 2D 형태 생성
 */
function createChamferedRectShape(width: number, height: number, chamfer: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  // 8개 꼭짓점에 챔퍼 적용
  shape.moveTo(x + chamfer, y);
  shape.lineTo(x + width - chamfer, y);
  shape.lineTo(x + width, y + chamfer);
  shape.lineTo(x + width, y + height - chamfer);
  shape.lineTo(x + width - chamfer, y + height);
  shape.lineTo(x + chamfer, y + height);
  shape.lineTo(x, y + height - chamfer);
  shape.lineTo(x, y + chamfer);
  shape.lineTo(x + chamfer, y);

  return shape;
}

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

  // 2D 형태 생성
  const shape = cornerStyle === 'rounded'
    ? createRoundedRectShape(width, height, cornerRadius)
    : createChamferedRectShape(width, height, cornerRadius);

  // ExtrudeGeometry로 두께 적용
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // 중앙 정렬 (ExtrudeGeometry는 기본적으로 한쪽으로 치우쳐 있음)
  geometry.translate(0, 0, -thickness / 2);

  return geometry;
}
