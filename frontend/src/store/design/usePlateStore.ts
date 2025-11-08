import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QRPlateConfig, ImageConfig, TextConfig } from '../../types/design';
import { generateUUID, createDefaultPlate } from '../../types/design';
import { serializeImages, deserializeImages } from '../../utils/storage/fileStorageAdapter';

interface PlateStore {
  // 멀티 플레이트 관리
  plates: QRPlateConfig[];
  selectedPlateId: string | null;

  // 전역 기본 색상 (새 판 추가 시 사용)
  globalPlateColor: string;
  globalQrColor: string;

  // Plate CRUD
  addPlate: () => QRPlateConfig;
  removePlate: (id: string) => void;
  duplicatePlate: (id: string) => QRPlateConfig | null;
  updatePlate: (id: string, updates: Partial<QRPlateConfig>) => void;
  updatePlateQuantity: (id: string, quantity: number) => void;
  selectPlate: (id: string | null) => void;

  // Image CRUD
  addImage: (plateId: string, file: File) => ImageConfig;
  removeImage: (plateId: string, imageId: string) => void;
  updateImage: (plateId: string, imageId: string, updates: Partial<Omit<ImageConfig, 'id' | 'file'>>) => void;

  // Text CRUD
  addText: (plateId: string, content?: string) => TextConfig;
  removeText: (plateId: string, textId: string) => void;
  updateText: (plateId: string, textId: string, updates: Partial<Omit<TextConfig, 'id'>>) => void;

  // 전역 기본 색상 설정
  setGlobalPlateColor: (color: string) => void;
  setGlobalQrColor: (color: string) => void;
}

export const usePlateStore = create<PlateStore>()(
  persist(
    (set, get) => {
      const initialPlateId = generateUUID();

      return {
        // 초기값: 1개 판 (자동 선택)
        plates: [createDefaultPlate(initialPlateId, '#ffffff', '#000000', 0)],
        selectedPlateId: initialPlateId,

        globalPlateColor: '#ffffff',
        globalQrColor: '#000000',

        // 새 판 추가 (전역 기본 색상 사용)
        addPlate: () => {
          const { plates, globalPlateColor, globalQrColor } = get();
          const newPlate = createDefaultPlate(
            generateUUID(),
            globalPlateColor,
            globalQrColor,
            plates.length
          );
          set({ plates: [...plates, newPlate], selectedPlateId: newPlate.id });
          return newPlate;
        },

        // 판 삭제
        removePlate: (id: string) => {
          const { plates, selectedPlateId } = get();
          const filtered = plates.filter(p => p.id !== id);

          // 삭제된 판이 선택되어 있었다면 선택 해제
          const newSelectedId = selectedPlateId === id ? null : selectedPlateId;

          set({ plates: filtered, selectedPlateId: newSelectedId });
        },

        // 판 복사
        duplicatePlate: (id: string) => {
          const { plates } = get();
          const original = plates.find(p => p.id === id);
          if (!original) return null;

          const duplicated: QRPlateConfig = {
            ...original,
            id: generateUUID(),
            positionX: plates.length * 120,
          };

          set({ plates: [...plates, duplicated], selectedPlateId: duplicated.id });
          return duplicated;
        },

        // 판 업데이트
        updatePlate: (id: string, updates: Partial<QRPlateConfig>) => {
          const { plates } = get();
          const updated = plates.map(p =>
            p.id === id ? { ...p, ...updates } : p
          );
          set({ plates: updated });
        },

        // 판 수량 업데이트
        updatePlateQuantity: (id: string, quantity: number) => {
          const { plates } = get();
          const clamped = Math.max(1, Math.min(99, quantity)); // 1~99 제한
          const updated = plates.map(p =>
            p.id === id ? { ...p, quantity: clamped } : p
          );
          set({ plates: updated });
        },

        // 판 선택
        selectPlate: (id: string | null) => {
          set({ selectedPlateId: id });
        },

        // 이미지 추가
        addImage: (plateId: string, file: File) => {
          const { plates } = get();
          const newImage: ImageConfig = {
            id: generateUUID(),
            file,
            size: 40,
            heightOffset: 0,
            horizontalOffset: 0,
          };
          const updated = plates.map(p =>
            p.id === plateId ? { ...p, images: [...p.images, newImage] } : p
          );
          set({ plates: updated });
          return newImage;
        },

        // 이미지 제거
        removeImage: (plateId: string, imageId: string) => {
          const { plates } = get();
          const updated = plates.map(p =>
            p.id === plateId ? { ...p, images: p.images.filter(img => img.id !== imageId) } : p
          );
          set({ plates: updated });
        },

        // 이미지 업데이트
        updateImage: (plateId: string, imageId: string, updates: Partial<Omit<ImageConfig, 'id' | 'file'>>) => {
          const { plates } = get();
          const updated = plates.map(p =>
            p.id === plateId
              ? {
                  ...p,
                  images: p.images.map(img =>
                    img.id === imageId ? { ...img, ...updates } : img
                  ),
                }
              : p
          );
          set({ plates: updated });
        },

        // 텍스트 추가
        addText: (plateId: string, content: string = '') => {
          const { plates } = get();
          const newText: TextConfig = {
            id: generateUUID(),
            content,
            font: 'Pretendard-Regular',
            size: 10,
            heightOffset: 0,
            horizontalOffset: 0,
          };
          const updated = plates.map(p =>
            p.id === plateId ? { ...p, texts: [...p.texts, newText] } : p
          );
          set({ plates: updated });
          return newText;
        },

        // 텍스트 제거
        removeText: (plateId: string, textId: string) => {
          const { plates } = get();
          const updated = plates.map(p =>
            p.id === plateId ? { ...p, texts: p.texts.filter(txt => txt.id !== textId) } : p
          );
          set({ plates: updated });
        },

        // 텍스트 업데이트
        updateText: (plateId: string, textId: string, updates: Partial<Omit<TextConfig, 'id'>>) => {
          const { plates } = get();
          const updated = plates.map(p =>
            p.id === plateId
              ? {
                  ...p,
                  texts: p.texts.map(txt =>
                    txt.id === textId ? { ...txt, ...updates } : txt
                  ),
                }
              : p
          );
          set({ plates: updated });
        },

        // 전역 기본 색상 설정
        setGlobalPlateColor: (color: string) => {
          set({ globalPlateColor: color });
        },

        setGlobalQrColor: (color: string) => {
          set({ globalQrColor: color });
        },
      };
    },
    {
      name: '3d-qr-design-store', // Keep same key for backward compatibility
      storage: {
        getItem: async (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const data = JSON.parse(str);

            // plates의 images를 File 객체로 복원 + 구버전 텍스트 마이그레이션
            if (data.state.plates) {
              const restoredPlates = await Promise.all(
                data.state.plates.map(async (plate: any) => {
                  let migratedPlate = { ...plate };

                  // 1. 이미지 복원
                  if (plate.images && Array.isArray(plate.images)) {
                    const restoredImages = deserializeImages(plate.images);
                    migratedPlate.images = restoredImages;
                  }

                  // 2. 구버전 텍스트 필드를 texts 배열로 마이그레이션
                  if (!migratedPlate.texts && plate.text !== undefined) {
                    const hasContent = plate.text && plate.text.trim().length > 0;
                    migratedPlate.texts = hasContent
                      ? [
                          {
                            id: generateUUID(),
                            content: plate.text,
                            font: plate.textFont || 'Pretendard-Regular',
                            size: plate.textSize || 10,
                            heightOffset: plate.textHeightOffset || 0,
                            horizontalOffset: plate.textHorizontalOffset || 0,
                          },
                        ]
                      : [];
                    // 구버전 필드 제거
                    delete migratedPlate.text;
                    delete migratedPlate.textFont;
                    delete migratedPlate.textSize;
                    delete migratedPlate.textHeightOffset;
                    delete migratedPlate.textHorizontalOffset;
                  }

                  return migratedPlate;
                })
              );
              data.state.plates = restoredPlates;
            }

            return data;
          } catch (error) {
            console.error('Failed to restore from localStorage:', error);
            return null;
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            // plates의 images를 Base64로 변환
            if (value.state.plates) {
              const serializedPlates = await Promise.all(
                value.state.plates.map(async (plate: QRPlateConfig) => {
                  if (plate.images && plate.images.length > 0) {
                    const serializedImages = await serializeImages(plate.images);
                    return { ...plate, images: serializedImages };
                  }
                  return plate;
                })
              );
              value.state.plates = serializedPlates;
            }

            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Failed to save to localStorage:', error);
            // QuotaExceededError 처리
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              console.warn('localStorage quota exceeded. Clearing old data...');
              localStorage.removeItem(name);
            }
          }
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
