/**
 * 주문 가격 계산 유틸리티
 */

export interface PricingParams {
  plateWidth: number;   // mm
  plateHeight: number;  // mm
  plateDepth: number;   // mm
  qrSize: number;       // mm
  qrDepth: number;      // mm
  standAngle: number;   // 거치대 각도 (90, 95, 100, 105, 110)
}

/**
 * 주문 가격 계산
 *
 * 가격 정책:
 * 1. 기본 가격: 10,000원
 * 2. 판 크기 비례: (width * height) / 10000 배수
 * 3. 거치대 각도별 추가 가격
 * 4. QR 복잡도: qrDepth에 비례 (1mm당 500원)
 */
export function calculatePrice(params: PricingParams): number {
  const basePrice = 10000; // 기본 가격 10,000원

  // 판 크기 비례 (100mm x 100mm 기준 1배)
  const sizeMultiplier = (params.plateWidth * params.plateHeight) / 10000;
  const sizePrice = basePrice * sizeMultiplier;

  // 거치대 각도별 추가 가격
  const anglePrice = {
    90: 2000,
    95: 2500,
    100: 3000,
    105: 3500,
    110: 4000,
  }[params.standAngle] || 3000;

  // QR 높이 추가 가격 (1mm당 500원)
  const qrHeightPrice = params.qrDepth * 500;

  // 총 가격 계산 (백원 단위 반올림)
  const totalPrice = sizePrice + anglePrice + qrHeightPrice;
  const roundedPrice = Math.round(totalPrice / 100) * 100;

  return roundedPrice;
}

/**
 * 가격을 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @returns "10,000원" 형식의 문자열
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}
