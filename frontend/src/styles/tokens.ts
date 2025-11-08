/**
 * 3D QR 플랫폼 - 디자인 토큰
 * UI 스타일의 일관성을 위한 중앙화된 디자인 토큰
 */

import { COLORS } from '../constants/colors';

export const tokens = {
  // 색상 (constants/colors.ts 기반)
  colors: COLORS,

  // 간격 (spacing)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  // 폰트 크기
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },

  // 테두리 반경
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
  },

  // Z-Index 계층
  zIndex: {
    dropdown: 10,
    modal: 1000,
    overlay: 2000,
    mobileModal: 10000,
  },
} as const;

// 타입 추론
export type TokensConfig = typeof tokens;
