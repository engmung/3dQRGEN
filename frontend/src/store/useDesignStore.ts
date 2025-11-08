/**
 * Legacy useDesignStore - Backward Compatibility Layer
 *
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 실제 구현은 store/design/* 파일들로 분리되었습니다.
 *
 * Group E-1 리팩토링 (2025-01-25):
 * - 428 lines → 3개 스토어로 분리 (~250 lines total)
 * - usePlateStore: 플레이트 CRUD, 이미지 관리 (213 lines)
 * - useQRConfigStore: QR 설정 (88 lines)
 * - useVisualConfigStore: 색상, 텍스트, 제품 타입 (125 lines)
 * - types/design.ts: 타입 정의 (143 lines)
 * - utils/storage/fileStorageAdapter.ts: 파일 직렬화 (61 lines)
 */

import { usePlateStore } from './design/usePlateStore';
import { useQRConfigStore } from './design/useQRConfigStore';
import { useVisualConfigStore, useTextConfig, useProductTypeConfig } from './design/useVisualConfigStore';

// 타입 re-export (기존 import 경로 유지)
export type { QRType, ProductType, QRPlateConfig, ImageConfig } from '../types/design';
export type { WiFiData, EmailData } from '../utils/qrGenerator';

/**
 * 기존 useDesignStore 호환 훅
 *
 * 모든 기능을 그대로 제공하지만, 내부적으로는 분리된 스토어를 사용합니다.
 * 기존 코드 수정 없이 사용 가능합니다.
 *
 * Zustand 훅 형태로 동작하며, selector를 통해 필요한 상태만 선택 가능합니다.
 */
export const useDesignStore = Object.assign(
  <T = any>(selector?: (state: any) => T): T => {
    // usePlateStore와 useVisualConfigStore의 상태를 구독
    const plateState = usePlateStore((state) => state);
    const visualState = useVisualConfigStore((state) => state);

    // 통합된 상태 객체
    const combinedState = {
      ...plateState,
      ...visualState,
    };

    // selector가 제공되면 해당 값만 반환, 없으면 전체 반환
    if (selector) {
      return selector(combinedState) as T;
    }

    return combinedState as T;
  },
  {
    // Zustand store의 getState() 메서드 호환성 제공
    getState: () => ({
      ...usePlateStore.getState(),
      ...useVisualConfigStore.getState(),
    }),
    setState: usePlateStore.setState, // 주의: plateStore를 기본으로 사용
    subscribe: usePlateStore.subscribe,
  }
);

// 개별 스토어도 export (새 코드에서 사용 가능)
export { usePlateStore, useQRConfigStore, useVisualConfigStore, useTextConfig, useProductTypeConfig };
