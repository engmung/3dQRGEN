import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WiFiData, EmailData } from '../utils/qrGenerator';

// QR 타입 정의
export type QRType = 'url' | 'wifi' | 'email';

// 제품 타입 정의
export type ProductType = 'stand' | 'card';

// UUID 생성 폴리필 (crypto.randomUUID가 없는 환경용)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: 간단한 UUID v4 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 유틸리티: File → Base64 DataURL
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 유틸리티: Base64 DataURL → File
function dataURLtoFile(dataUrl: string, filename: string, mimeType: string): File {
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
}

// 이미지 설정 (저장용 - Base64)
interface ImageConfigStored {
  id: string;
  fileName: string;
  fileType: string;
  fileDataUrl: string;
  size: number;
  heightOffset: number;
  horizontalOffset: number;
}

// 이미지 설정 (런타임용 - File 객체)
export interface ImageConfig {
  id: string;
  file: File;
  size: number;               // 이미지 크기 (mm)
  heightOffset: number;       // 이미지 높이 오프셋 (upVector 방향, mm)
  horizontalOffset: number;   // 이미지 좌우 오프셋 (rightVector 방향, mm)
}

// 개별 QR 판 설정
export interface QRPlateConfig {
  id: string;

  // 제품 타입
  productType: ProductType; // 'stand' (거치대) 또는 'card' (명함)

  // 명함 전용 설정 (productType === 'card'일 때만 사용)
  cardWidth: number;        // 명함 가로 (mm, 기본: 90)
  cardHeight: number;       // 명함 세로 (mm, 기본: 50)
  cardThickness: number;    // 명함 두께 (mm, 기본: 2)

  // QR 타입 및 데이터
  qrType: QRType;          // QR 타입
  qrUrl: string;           // URL 타입일 때 사용
  qrWifiData: WiFiData;    // WiFi 타입일 때 사용
  qrEmailData: EmailData;  // Email 타입일 때 사용

  // QR 공통 설정
  qrSize: number;          // QR 크기 (mm)
  qrThickness: number;     // QR 두께 (mm)
  qrHeightOffset: number;  // QR 높이 오프셋 (upVector 방향, mm)
  qrHorizontalOffset: number; // QR 좌우 오프셋 (rightVector 방향, mm)

  // 텍스트 설정
  text: string;                    // 텍스트 내용
  textFont: string;                // 폰트명
  textSize: number;                // 텍스트 크기 (mm)
  textHeightOffset: number;        // 텍스트 높이 오프셋 (upVector 방향, mm)
  textHorizontalOffset: number;    // 텍스트 좌우 오프셋 (rightVector 방향, mm)

  // 이미지 설정 (배열로 변경)
  images: ImageConfig[];

  // 색상
  plateColor: string;
  qrColor: string; // QR, 텍스트, 이미지 공용

  // 주문 수량
  quantity: number;

  // 3D 씬 내 위치
  positionX: number;
  positionY: number;
  positionZ: number;
}

interface DesignStore {
  // 멀티 플레이트 관리
  plates: QRPlateConfig[];
  selectedPlateId: string | null;

  // 전역 색상 (새 판 추가 시 기본값)
  globalPlateColor: string;
  globalQrColor: string;

  // 3D 씬 배경 색상
  backgroundColor: string;

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

  // 전역 색상 설정
  setGlobalPlateColor: (color: string) => void;
  setGlobalQrColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;

  // 선택된 판의 색상 변경 (전역 + 개별)
  updateSelectedPlateColor: (color: string) => void;
  updateSelectedQrColor: (color: string) => void;
}

// 기본 QR 판 설정 생성
const createDefaultPlate = (
  id: string,
  plateColor: string,
  qrColor: string,
  index: number = 0
): QRPlateConfig => ({
  id,
  // 제품 타입
  productType: 'stand',    // 기본: QR 거치대
  // 명함 전용 설정
  cardWidth: 90,           // 명함 가로 (기본: 90mm)
  cardHeight: 50,          // 명함 세로 (기본: 50mm)
  cardThickness: 2,        // 명함 두께 (기본: 2mm)
  // QR 타입 및 데이터
  qrType: 'url',                          // 기본 타입: URL
  qrUrl: 'https://example.com',           // URL 기본값
  qrWifiData: {                           // WiFi 기본값
    ssid: '',
    password: '',
    security: 'WPA',
  },
  qrEmailData: {                          // Email 기본값
    recipient: '',
    subject: '',
    body: '',
  },
  // QR 공통 설정
  qrSize: 50,              // 기본 50mm
  qrThickness: 2,          // 기본 2mm
  qrHeightOffset: 0,       // 기본 0mm (upVector 방향 오프셋, GLB 표면에 맞춤)
  qrHorizontalOffset: 0,   // 기본 0mm (rightVector 방향 오프셋)
  text: '',                // 기본 빈 텍스트
  textFont: 'Pretendard-Regular', // 기본 폰트
  textSize: 10,            // 기본 10mm
  textHeightOffset: 0,     // 기본 0mm
  textHorizontalOffset: 0, // 기본 0mm
  images: [],              // 기본 이미지 없음 (빈 배열)
  plateColor,
  qrColor, // QR, 텍스트, 이미지 색상 공용
  quantity: 1,             // 기본 수량 1개
  // 새 판은 X축으로 간격을 두고 배치
  positionX: index * 120,
  positionY: 0,
  positionZ: 0,
});

export const useDesignStore = create<DesignStore>()(
  persist(
    (set, get) => {
      const initialPlateId = generateUUID();

      return {
        // 초기값: 1개 판 (자동 선택)
        plates: [createDefaultPlate(initialPlateId, '#ffffff', '#000000', 0)],
        selectedPlateId: initialPlateId,

        globalPlateColor: '#ffffff',
        globalQrColor: '#000000',
        backgroundColor: '#D2B48C',

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

  // 전역 색상 설정
  setGlobalPlateColor: (color: string) => {
    set({ globalPlateColor: color });
  },

  setGlobalQrColor: (color: string) => {
    set({ globalQrColor: color });
  },

  setBackgroundColor: (color: string) => {
    set({ backgroundColor: color });
  },

  // 선택된 판의 색상 변경 (전역 + 개별)
  updateSelectedPlateColor: (color: string) => {
    const { selectedPlateId, updatePlate } = get();
    set({ globalPlateColor: color });
    if (selectedPlateId) {
      updatePlate(selectedPlateId, { plateColor: color });
    }
  },

  updateSelectedQrColor: (color: string) => {
    const { selectedPlateId, updatePlate } = get();
    set({ globalQrColor: color });
    if (selectedPlateId) {
      updatePlate(selectedPlateId, { qrColor: color });
    }
  },
};
    },
    {
      name: '3d-qr-design-store',
      storage: {
        getItem: async (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const data = JSON.parse(str);

            // plates의 images를 File 객체로 복원
            if (data.state.plates) {
              const restoredPlates = await Promise.all(
                data.state.plates.map(async (plate: any) => {
                  if (plate.images && Array.isArray(plate.images)) {
                    const restoredImages = plate.images.map((img: ImageConfigStored) => ({
                      id: img.id,
                      file: dataURLtoFile(img.fileDataUrl, img.fileName, img.fileType),
                      size: img.size,
                      heightOffset: img.heightOffset,
                      horizontalOffset: img.horizontalOffset,
                    }));
                    return { ...plate, images: restoredImages };
                  }
                  return plate;
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
                    const serializedImages = await Promise.all(
                      plate.images.map(async (img: ImageConfig) => {
                        const dataUrl = await fileToDataURL(img.file);
                        return {
                          id: img.id,
                          fileName: img.file.name,
                          fileType: img.file.type,
                          fileDataUrl: dataUrl,
                          size: img.size,
                          heightOffset: img.heightOffset,
                          horizontalOffset: img.horizontalOffset,
                        } as ImageConfigStored;
                      })
                    );
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
