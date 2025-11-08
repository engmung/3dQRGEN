/**
 * 3D QR 플랫폼 - 크기 관련 상수
 * 모든 크기는 mm 단위
 */

export const DIMENSIONS = {
  // QR 거치대 (Stand)
  STAND: {
    PLATE_WIDTH: 60, // 거치대 판 너비
  },

  // 명함 (Card)
  CARD: {
    DEFAULT_WIDTH: 90,
    DEFAULT_HEIGHT: 50,
    DEFAULT_THICKNESS: 2,
    MIN_WIDTH: 20,
    MAX_WIDTH: 120,
    MIN_HEIGHT: 20,
    MAX_HEIGHT: 80,
    MIN_THICKNESS: 1,
    MAX_THICKNESS: 3,
    THICKNESS_STEP: 0.1,
  },

  // QR 코드
  QR: {
    DEFAULT_SIZE: 50,
    DEFAULT_THICKNESS: 2,
    MIN_SIZE: 20,
    MAX_SIZE: 120,
    MIN_THICKNESS: 1,
    MAX_THICKNESS: 3,
  },

  // 텍스트
  TEXT: {
    DEFAULT_SIZE: 10,
    MIN_SIZE: 2,
    MAX_SIZE: 30,
    DEFAULT_FONT: 'Pretendard-Regular',
  },

  // 이미지
  IMAGE: {
    DEFAULT_SIZE: 40,
    MIN_SIZE: 3,
    MAX_SIZE: 60,
    CONTOUR_RESOLUTION: 400, // 이미지 윤곽 추출 해상도
  },

  // Geometry 관련
  GEOMETRY: {
    BASE_THICKNESS: 1, // 기본 두께 (mm)
    NORMAL_OFFSET: 0.01, // Z-fighting 방지 오프셋 (mm)
    CURVE_SEGMENTS: 12, // 텍스트/이미지 곡선 세그먼트 수
  },

  // 레이아웃
  LAYOUT: {
    PLATE_SPACING_X: 120, // 플레이트 간 X축 간격 (mm)
  },

  // 수량
  QUANTITY: {
    MIN: 1,
    MAX: 99,
    DEFAULT: 1,
  },
} as const;

// 타입 추론을 위한 export
export type DimensionsConfig = typeof DIMENSIONS;
