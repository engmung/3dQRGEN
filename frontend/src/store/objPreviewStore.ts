import { create } from 'zustand';
import { OBJ_EXPORT_DEFAULTS } from '../config/objExportDefaults';

export interface Transform {
  position: [number, number, number]; // [x, y, z] in mm
  rotation: [number, number, number]; // [x, y, z] in degrees
}

type TransformKey = 'backTransform' | 'brigeTransform' | 'frontTransform' | 'pinTransform';

interface OBJPreviewStore {
  // 파츠별 Transform (디버깅용 오프셋)
  backTransform: Transform;
  brigeTransform: Transform;
  frontTransform: Transform;
  pinTransform: Transform;

  // 전체 Export Transform (전체를 눕히기)
  globalRotation: [number, number, number]; // [x, y, z] in degrees

  // 업데이트 함수
  updateBackTransform: (transform: Partial<Transform>) => void;
  updateBrigeTransform: (transform: Partial<Transform>) => void;
  updateFrontTransform: (transform: Partial<Transform>) => void;
  updatePinTransform: (transform: Partial<Transform>) => void;
  updateGlobalRotation: (rotation: [number, number, number]) => void;

  // 리셋
  resetAllTransforms: () => void;
}

/**
 * Transform 업데이트 함수를 생성하는 팩토리 함수
 * 중복된 업데이트 로직을 하나의 제네릭 함수로 통합
 */
const createTransformUpdater = (key: TransformKey) => {
  return (transform: Partial<Transform>) =>
    (state: OBJPreviewStore): Partial<OBJPreviewStore> => ({
      [key]: {
        position: transform.position ?? state[key].position,
        rotation: transform.rotation ?? state[key].rotation,
      },
    });
};

export const useOBJPreviewStore = create<OBJPreviewStore>((set) => ({
  // 초기값 (config에서 가져옴)
  backTransform: { ...OBJ_EXPORT_DEFAULTS.back },
  brigeTransform: { ...OBJ_EXPORT_DEFAULTS.bridge },
  frontTransform: { ...OBJ_EXPORT_DEFAULTS.front },
  pinTransform: { ...OBJ_EXPORT_DEFAULTS.pin },
  globalRotation: [...OBJ_EXPORT_DEFAULTS.globalRotation],

  // 업데이트 함수 (팩토리 함수로 생성)
  updateBackTransform: (transform) => set(createTransformUpdater('backTransform')(transform)),
  updateBrigeTransform: (transform) => set(createTransformUpdater('brigeTransform')(transform)),
  updateFrontTransform: (transform) => set(createTransformUpdater('frontTransform')(transform)),
  updatePinTransform: (transform) => set(createTransformUpdater('pinTransform')(transform)),
  updateGlobalRotation: (rotation) => set({ globalRotation: rotation }),

  // 리셋 (config에서 기본값 가져옴)
  resetAllTransforms: () =>
    set({
      backTransform: { ...OBJ_EXPORT_DEFAULTS.back },
      brigeTransform: { ...OBJ_EXPORT_DEFAULTS.bridge },
      frontTransform: { ...OBJ_EXPORT_DEFAULTS.front },
      pinTransform: { ...OBJ_EXPORT_DEFAULTS.pin },
      globalRotation: [...OBJ_EXPORT_DEFAULTS.globalRotation],
    }),
}));
