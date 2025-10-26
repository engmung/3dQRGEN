import { create } from 'zustand';
import type { WiFiData, EmailData } from '../utils/qrGenerator';

// QR 타입 정의
export type QRType = 'url' | 'wifi' | 'email';

// 개별 QR 판 설정
export interface QRPlateConfig {
  id: string;

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

  // 이미지 설정
  imageFile: File | null;          // 업로드된 이미지 파일
  imageSize: number;               // 이미지 크기 (mm)
  imageHeightOffset: number;       // 이미지 높이 오프셋 (upVector 방향, mm)
  imageHorizontalOffset: number;   // 이미지 좌우 오프셋 (rightVector 방향, mm)

  // 색상
  plateColor: string;
  qrColor: string; // QR, 텍스트, 이미지 공용

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

  // Plate CRUD
  addPlate: () => void;
  removePlate: (id: string) => void;
  updatePlate: (id: string, updates: Partial<QRPlateConfig>) => void;
  selectPlate: (id: string | null) => void;

  // 전역 색상 설정
  setGlobalPlateColor: (color: string) => void;
  setGlobalQrColor: (color: string) => void;

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
  qrHeightOffset: 2.9,     // 기본 2.9mm (upVector 방향 오프셋)
  qrHorizontalOffset: 0,   // 기본 0mm (rightVector 방향 오프셋)
  text: '',                // 기본 빈 텍스트
  textFont: 'Pretendard-Regular', // 기본 폰트
  textSize: 10,            // 기본 10mm
  textHeightOffset: 0,     // 기본 0mm
  textHorizontalOffset: 0, // 기본 0mm
  imageFile: null,         // 기본 이미지 없음
  imageSize: 40,           // 기본 40mm
  imageHeightOffset: 0,    // 기본 0mm
  imageHorizontalOffset: 0, // 기본 0mm
  plateColor,
  qrColor, // QR, 텍스트, 이미지 색상 공용
  // 새 판은 X축으로 간격을 두고 배치
  positionX: index * 120,
  positionY: 0,
  positionZ: 0,
});

export const useDesignStore = create<DesignStore>((set, get) => {
  const initialPlateId = crypto.randomUUID();

  return {
    // 초기값: 1개 판 (자동 선택)
    plates: [createDefaultPlate(initialPlateId, '#ffffff', '#000000', 0)],
    selectedPlateId: initialPlateId,

    globalPlateColor: '#ffffff',
    globalQrColor: '#000000',

  // 새 판 추가
  addPlate: () => {
    const { plates, globalPlateColor, globalQrColor } = get();
    const newPlate = createDefaultPlate(
      crypto.randomUUID(),
      globalPlateColor,
      globalQrColor,
      plates.length
    );
    set({ plates: [...plates, newPlate], selectedPlateId: newPlate.id });
  },

  // 판 삭제
  removePlate: (id: string) => {
    const { plates, selectedPlateId } = get();
    const filtered = plates.filter(p => p.id !== id);

    // 삭제된 판이 선택되어 있었다면 선택 해제
    const newSelectedId = selectedPlateId === id ? null : selectedPlateId;

    set({ plates: filtered, selectedPlateId: newSelectedId });
  },

  // 판 업데이트
  updatePlate: (id: string, updates: Partial<QRPlateConfig>) => {
    const { plates } = get();
    const updated = plates.map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    set({ plates: updated });
  },

  // 판 선택
  selectPlate: (id: string | null) => {
    set({ selectedPlateId: id });
  },

  // 전역 색상 설정
  setGlobalPlateColor: (color: string) => {
    set({ globalPlateColor: color });
  },

  setGlobalQrColor: (color: string) => {
    set({ globalQrColor: color });
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
});
