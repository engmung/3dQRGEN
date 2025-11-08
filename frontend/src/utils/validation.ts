import { DIMENSIONS } from '../constants/dimensions';

// 수량 검증
export const clampQuantity = (qty: number): number =>
  Math.max(DIMENSIONS.QUANTITY.MIN, Math.min(DIMENSIONS.QUANTITY.MAX, qty));

// 주문 취소 가능 여부
export const canCancelOrder = (status: string): boolean =>
  status === 'pending' || status === 'paid';

// 이메일 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 검증 (한국)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};
