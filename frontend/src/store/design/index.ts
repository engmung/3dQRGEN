/**
 * 디자인 스토어 통합 모듈
 *
 * Group E-1 리팩토링: useDesignStore (428 lines)를 3개의 전문 스토어로 분리
 * - usePlateStore: 플레이트 CRUD 및 이미지 관리
 * - useQRConfigStore: QR 설정 관리
 * - useVisualConfigStore: 색상, 텍스트, 제품 타입 관리
 */

export { usePlateStore } from './usePlateStore';
export { useQRConfigStore } from './useQRConfigStore';
export { useVisualConfigStore, useTextConfig, useProductTypeConfig } from './useVisualConfigStore';

// 타입도 함께 re-export
export type { QRType, ProductType, QRPlateConfig, ImageConfig, ImageConfigStored } from '../../types/design';
