/**
 * 3D QR 플랫폼 - 반응형 Breakpoint 상수
 * useMediaQuery 훅에서 사용
 */

export const BREAKPOINTS = {
  mobile: {
    max: 767, // px
  },
  tablet: {
    min: 768,
    max: 1023,
  },
  desktop: {
    min: 1024,
  },
} as const;

// 미디어 쿼리 문자열 생성 헬퍼
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop.min}px)`,
} as const;

export type BreakpointsConfig = typeof BREAKPOINTS;
