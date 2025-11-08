import { PRICING } from '../constants/pricing';

// 가격 포맷팅
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(PRICING.FORMAT.LOCALE, {
    style: 'currency',
    currency: PRICING.FORMAT.CURRENCY,
  }).format(price);
};

// 날짜 포맷팅
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 짧은 날짜 포맷
export const formatDateShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  });
};

// 전화번호 포맷팅 (하이픈 추가)
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// 제품 합계 계산 (총액 - 배송비)
export const calculateProductTotal = (totalPrice: number): number => {
  return totalPrice - PRICING.SHIPPING_FEE;
};
