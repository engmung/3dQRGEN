/**
 * 주문 가격 계산 유틸리티
 *
 * 간단한 고정 가격 시스템
 */

/**
 * 주문 가격 계산
 *
 * 가격 정책:
 * - 기본 가격: 15,000원 (고정)
 */
export function calculatePrice(): number {
  return 15000; // 고정 가격
}

/**
 * 가격을 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @returns "15,000원" 형식의 문자열
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}
