/**
 * 주문 가격 계산 유틸리티
 */

import { fetchPricingSettings, type PricingSettings } from './api';
import type { QRPlateConfig } from '../store/useDesignStore';

// Re-export PricingSettings
export type { PricingSettings };

// 가격 설정 캐싱
let cachedPricingSettings: PricingSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1분

/**
 * 가격 설정 가져오기 (캐싱 포함)
 */
export async function getPricingSettings(): Promise<PricingSettings> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedPricingSettings && now - lastFetchTime < CACHE_DURATION) {
    return cachedPricingSettings;
  }

  // API 호출
  try {
    cachedPricingSettings = await fetchPricingSettings();
    lastFetchTime = now;
    return cachedPricingSettings;
  } catch (error) {
    console.error('Failed to fetch pricing settings, using defaults:', error);
    // 기본값 반환
    return {
      base_price: 20000,
      card_base_price: 10000,
      text_price: 5000,
      image_price: 5000,
    };
  }
}

/**
 * 가격 캐시 무효화 (설정 변경 후 호출)
 */
export function invalidatePricingCache() {
  cachedPricingSettings = null;
  lastFetchTime = 0;
}

/**
 * 단일 판의 가격 계산
 *
 * @param plateConfig QR 판 설정
 * @param pricingSettings 가격 설정 (옵션, 없으면 캐시 사용)
 * @returns 가격
 */
export function calculatePlatePrice(
  plateConfig: QRPlateConfig,
  pricingSettings: PricingSettings
): number {
  // 제품 타입에 따라 기본 가격 설정
  let price = plateConfig.productType === 'card'
    ? pricingSettings.card_base_price  // 명함 기본가
    : pricingSettings.base_price;      // 거치대 기본가

  // 텍스트 개수만큼 추가 요금 (비어있지 않은 텍스트만 카운트)
  const textCount = plateConfig.texts.filter(txt => txt.content && txt.content.trim().length > 0).length;
  if (textCount > 0) {
    price += pricingSettings.text_price * textCount;
  }

  // 이미지 개수만큼 추가 요금
  const imageCount = plateConfig.images.length;
  if (imageCount > 0) {
    price += pricingSettings.image_price * imageCount;
  }

  return price;
}

/**
 * 여러 판의 총 가격 계산
 *
 * @param plates QR 판 설정 배열
 * @param pricingSettings 가격 설정
 * @returns 총 가격
 */
export function calculateTotalPrice(
  plates: QRPlateConfig[],
  pricingSettings: PricingSettings
): number {
  return plates.reduce((total, plate) => {
    return total + calculatePlatePrice(plate, pricingSettings);
  }, 0);
}

/**
 * 가격을 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @returns "20,000원" 형식의 문자열
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}
