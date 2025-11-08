/**
 * 3D QR 플랫폼 - localStorage 키 상수
 */

export const STORAGE_KEYS = {
  // 디자인 스토어 (useDesignStore)
  DESIGN_STORE: '3d-qr-design-store',

  // 주문 폼 데이터 (AddressForm)
  ADDRESS_FORM: 'addressFormData',

  // 색상 선택 모달 위치
  COLOR_MODAL_POSITION: {
    PLATE: 'colorModalPosition-plate',
    QR: 'colorModalPosition-qr',
    BACKGROUND: 'colorModalPosition-background',
  },
} as const;

export type StorageKeysConfig = typeof STORAGE_KEYS;
