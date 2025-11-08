import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlateStore } from './usePlateStore';
import type { ProductType } from '../../types/design';

interface VisualConfigStore {
  // 3D 씬 배경 색상
  backgroundColor: string;

  // 배경 색상 설정
  setBackgroundColor: (color: string) => void;

  // 선택된 판의 색상 변경 (전역 + 개별)
  updateSelectedPlateColor: (color: string) => void;
  updateSelectedQrColor: (color: string) => void;
}

export const useVisualConfigStore = create<VisualConfigStore>()(
  persist(
    (set) => ({
      backgroundColor: '#D2B48C',

      setBackgroundColor: (color: string) => {
        set({ backgroundColor: color });
      },

      updateSelectedPlateColor: (color: string) => {
        const { selectedPlateId, updatePlate, setGlobalPlateColor } = usePlateStore.getState();
        setGlobalPlateColor(color);
        if (selectedPlateId) {
          updatePlate(selectedPlateId, { plateColor: color });
        }
      },

      updateSelectedQrColor: (color: string) => {
        const { selectedPlateId, updatePlate, setGlobalQrColor } = usePlateStore.getState();
        setGlobalQrColor(color);
        if (selectedPlateId) {
          updatePlate(selectedPlateId, { qrColor: color });
        }
      },
    }),
    {
      name: '3d-qr-visual-store',
    }
  )
);

/**
 * 텍스트 설정 훅 (선택된 판에 대한)
 */
export const useTextConfig = () => {
  const plates = usePlateStore(state => state.plates);
  const selectedPlateId = usePlateStore(state => state.selectedPlateId);
  const updatePlate = usePlateStore(state => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);

  return {
    text: selectedPlate?.text ?? '',
    textFont: selectedPlate?.textFont ?? 'Pretendard-Regular',
    textSize: selectedPlate?.textSize ?? 10,
    textHeightOffset: selectedPlate?.textHeightOffset ?? 0,
    textHorizontalOffset: selectedPlate?.textHorizontalOffset ?? 0,

    setText: (text: string) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { text });
      }
    },

    setTextFont: (textFont: string) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { textFont });
      }
    },

    setTextSize: (textSize: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { textSize });
      }
    },

    setTextHeightOffset: (textHeightOffset: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { textHeightOffset });
      }
    },

    setTextHorizontalOffset: (textHorizontalOffset: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { textHorizontalOffset });
      }
    },
  };
};

/**
 * 명함/거치대 타입 설정 훅
 */
export const useProductTypeConfig = () => {
  const plates = usePlateStore(state => state.plates);
  const selectedPlateId = usePlateStore(state => state.selectedPlateId);
  const updatePlate = usePlateStore(state => state.updatePlate);

  const selectedPlate = plates.find(p => p.id === selectedPlateId);

  return {
    productType: selectedPlate?.productType ?? 'stand',
    cardWidth: selectedPlate?.cardWidth ?? 90,
    cardHeight: selectedPlate?.cardHeight ?? 50,
    cardThickness: selectedPlate?.cardThickness ?? 2,

    setProductType: (productType: ProductType) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { productType });
      }
    },

    setCardWidth: (cardWidth: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { cardWidth });
      }
    },

    setCardHeight: (cardHeight: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { cardHeight });
      }
    },

    setCardThickness: (cardThickness: number) => {
      if (selectedPlateId) {
        updatePlate(selectedPlateId, { cardThickness });
      }
    },
  };
};
