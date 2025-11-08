/**
 * 3D QR 플랫폼 - 가격 관련 상수
 */

export const PRICING = {
  // 배송비 (전체 주문당)
  SHIPPING_FEE: 5000,

  // 기본 가격 (서버에서 가져오지 못할 경우 사용)
  DEFAULTS: {
    // QR 거치대
    STAND: {
      BASE_PRICE: 20000, // 기본가 (판 + QR)
      TEXT_PRICE: 5000, // 텍스트 추가 시
      IMAGE_PRICE: 5000, // 이미지 1개당
    },

    // QR 명함
    CARD: {
      BASE_PRICE: 10000, // 기본가 (명함판 + QR)
      TEXT_PRICE: 2000, // 텍스트 추가 시
      IMAGE_PRICE: 2000, // 이미지 1개당
    },
  },

  // 캐시 설정
  CACHE: {
    DURATION_MS: 60000, // 1분 (가격 정보 캐싱 시간)
  },

  // 포맷 설정
  FORMAT: {
    LOCALE: 'ko-KR',
    CURRENCY: 'KRW',
  },
} as const;

export type PricingConfig = typeof PRICING;
