import { create } from 'zustand';

export interface Transform {
  position: [number, number, number]; // [x, y, z] in mm
  rotation: [number, number, number]; // [x, y, z] in degrees
}

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

const defaultTransform: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
};

const defaultBackTransform: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, -70],
};

const defaultBrigeTransform: Transform = {
  position: [75, 0, 0],
  rotation: [0, 90, 0],
};

const defaultFrontTransform: Transform = {
  position: [77, 0, 65],
  rotation: [0, 0, 70],
};

const defaultPinTransform: Transform = {
  position: [68, 0, 0],
  rotation: [0, 0, 0],
};

export const useOBJPreviewStore = create<OBJPreviewStore>((set) => ({
  backTransform: { ...defaultBackTransform },
  brigeTransform: { ...defaultBrigeTransform },
  frontTransform: { ...defaultFrontTransform },
  pinTransform: { ...defaultPinTransform },
  globalRotation: [0, 0, 0], // Preview용: 회전 없음

  updateBackTransform: (transform) =>
    set((state) => ({
      backTransform: {
        position: transform.position ?? state.backTransform.position,
        rotation: transform.rotation ?? state.backTransform.rotation,
      },
    })),

  updateBrigeTransform: (transform) =>
    set((state) => ({
      brigeTransform: {
        position: transform.position ?? state.brigeTransform.position,
        rotation: transform.rotation ?? state.brigeTransform.rotation,
      },
    })),

  updateFrontTransform: (transform) =>
    set((state) => ({
      frontTransform: {
        position: transform.position ?? state.frontTransform.position,
        rotation: transform.rotation ?? state.frontTransform.rotation,
      },
    })),

  updatePinTransform: (transform) =>
    set((state) => ({
      pinTransform: {
        position: transform.position ?? state.pinTransform.position,
        rotation: transform.rotation ?? state.pinTransform.rotation,
      },
    })),

  updateGlobalRotation: (rotation) => set({ globalRotation: rotation }),

  resetAllTransforms: () =>
    set({
      backTransform: { ...defaultBackTransform },
      brigeTransform: { ...defaultBrigeTransform },
      frontTransform: { ...defaultFrontTransform },
      pinTransform: { ...defaultPinTransform },
      globalRotation: [0, 0, 0],
    }),
}));
