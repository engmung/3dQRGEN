/**
 * 3D QR 플랫폼 - OBJ Export 기본 설정
 * objPreviewStore에서 사용하는 기본 Transform 값
 */

import type { Transform } from '../store/objPreviewStore';

/**
 * 기본 Transform (위치/회전 없음)
 */
export const DEFAULT_TRANSFORM: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
};

/**
 * 뒷면 파츠 기본 Transform
 */
export const DEFAULT_BACK_TRANSFORM: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, -70],
};

/**
 * 브릿지 파츠 기본 Transform
 */
export const DEFAULT_BRIDGE_TRANSFORM: Transform = {
  position: [75, 0, 0],
  rotation: [0, 90, 0],
};

/**
 * 앞면 파츠 기본 Transform
 */
export const DEFAULT_FRONT_TRANSFORM: Transform = {
  position: [77, 0, 65],
  rotation: [0, 0, 70],
};

/**
 * 핀 파츠 기본 Transform
 */
export const DEFAULT_PIN_TRANSFORM: Transform = {
  position: [68, 0, 0],
  rotation: [0, 0, 0],
};

/**
 * 전체 Export Transform (기본값: 회전 없음)
 */
export const DEFAULT_GLOBAL_ROTATION: [number, number, number] = [0, 0, 0];

/**
 * 모든 기본 Transform 설정
 */
export const OBJ_EXPORT_DEFAULTS = {
  back: DEFAULT_BACK_TRANSFORM,
  bridge: DEFAULT_BRIDGE_TRANSFORM,
  front: DEFAULT_FRONT_TRANSFORM,
  pin: DEFAULT_PIN_TRANSFORM,
  globalRotation: DEFAULT_GLOBAL_ROTATION,
} as const;
