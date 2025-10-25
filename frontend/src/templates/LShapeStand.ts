import { cuboid } from '@jscad/modeling/src/primitives';
import { union, subtract } from '@jscad/modeling/src/operations/booleans';
import { translate } from '@jscad/modeling/src/operations/transforms';
import type { DesignTemplate } from './types';

export const LShapeStand: DesignTemplate = {
  id: 'l-shape',
  name: 'L자형 거치대',
  description: '베이스와 수직 판으로 구성된 기본 L자형 거치대',

  parameters: [
    // 베이스 치수
    {
      key: 'baseWidth',
      label: '베이스 너비',
      type: 'number',
      default: 80,
      min: 50,
      max: 150,
      step: 5,
      unit: 'mm'
    },
    {
      key: 'baseDepth',
      label: '베이스 깊이',
      type: 'number',
      default: 60,
      min: 40,
      max: 100,
      step: 5,
      unit: 'mm'
    },
    {
      key: 'baseThickness',
      label: '베이스 두께',
      type: 'number',
      default: 3,
      min: 2,
      max: 10,
      step: 0.5,
      unit: 'mm'
    },

    // 수직 판 치수
    {
      key: 'plateHeight',
      label: '판 높이',
      type: 'number',
      default: 100,
      min: 60,
      max: 200,
      step: 5,
      unit: 'mm'
    },
    {
      key: 'plateThickness',
      label: '판 두께',
      type: 'number',
      default: 3,
      min: 2,
      max: 10,
      step: 0.5,
      unit: 'mm'
    },

    // QR 설정
    {
      key: 'qrSize',
      label: 'QR 크기',
      type: 'number',
      default: 50,
      min: 30,
      max: 80,
      step: 5,
      unit: 'mm'
    },
    {
      key: 'qrDepth',
      label: 'QR 깊이',
      type: 'number',
      default: 2,
      min: 0.5,
      max: 5,
      step: 0.5,
      unit: 'mm'
    },
    {
      key: 'qrOffsetTop',
      label: 'QR 상단 여백',
      type: 'number',
      default: 10,
      min: 5,
      max: 30,
      step: 1,
      unit: 'mm'
    },
  ],

  generate: (params) => {
    const {
      baseWidth,
      baseDepth,
      baseThickness,
      plateHeight,
      plateThickness,
      qrSize,
      qrDepth,
      qrOffsetTop,
    } = params;

    // 1. 베이스 생성
    const base = cuboid({
      size: [baseWidth, baseThickness, baseDepth],
      center: [0, baseThickness / 2, 0]
    });

    // 2. 수직 판 생성 (베이스 뒤쪽에 세움)
    const plate = cuboid({
      size: [baseWidth, plateHeight, plateThickness],
      center: [0, plateHeight / 2, -baseDepth / 2 + plateThickness / 2]
    });

    // 3. 베이스 + 판 결합
    let stand = union(base, plate);

    // 4. QR 코드 영역 음각 (간단한 큐브로 표시)
    const qrCavity = cuboid({
      size: [qrSize, qrDepth, qrSize],
      center: [
        0,
        plateHeight - qrOffsetTop - qrSize / 2,
        -baseDepth / 2 + plateThickness / 2
      ]
    });

    stand = subtract(stand, qrCavity);

    return stand;
  }
};
