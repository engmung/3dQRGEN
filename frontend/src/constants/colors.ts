/**
 * 3D QR 플랫폼 - 색상 관련 상수
 */

export const COLORS = {
  // 기본 브랜드 색상
  PRIMARY: '#FF6B6B',
  SECONDARY: '#4A90E2',
  SUCCESS: '#4CAF50',
  WARNING: '#FFC107',
  DANGER: '#F44336',
  INFO: '#2196F3',

  // 상태별 색상
  STATUS: {
    PENDING: '#FFC107', // 입금 대기
    PAID: '#2196F3', // 입금 확인
    IN_PRODUCTION: '#9C27B0', // 제작 중
    SHIPPED: '#4CAF50', // 배송 시작
    DELIVERED: '#66BB6A', // 배송 완료
    CANCELLED: '#F44336', // 취소
  },

  // 용량/가용성 색상
  CAPACITY: {
    AVAILABLE: '#4CAF50', // 초록 (여유)
    LIMITED: '#FFC107', // 노랑 (부족)
    FULL: '#EF5350', // 빨강 (마감)
    CLOSED: '#9E9E9E', // 회색 (휴무)
  },

  // UI 색상
  UI: {
    BACKGROUND: '#F8F6F3',
    BACKGROUND_ALT: '#D2B48C', // Tan (3D 씬 배경)
    BORDER: '#E5E0DB',
    BORDER_LIGHT: '#DDD',
    TEXT_PRIMARY: '#333',
    TEXT_SECONDARY: '#666',
    TEXT_DISABLED: '#999',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.3)',
  },

  // 기본 판/QR 색상
  DEFAULTS: {
    PLATE: '#FFFFFF',
    QR: '#000000',
    BACKGROUND: '#D2B48C',
  },

  // 버튼 색상
  BUTTON: {
    PRIMARY: '#FF6B6B',
    PRIMARY_HOVER: '#FF5252',
    SECONDARY: '#4A90E2',
    SECONDARY_HOVER: '#357ABD',
    SUCCESS: '#4CAF50',
    SUCCESS_HOVER: '#45A049',
    DANGER: '#F44336',
    DANGER_HOVER: '#D32F2F',
    GHOST: 'transparent',
  },
} as const;

// 타입 추론
export type ColorsConfig = typeof COLORS;
