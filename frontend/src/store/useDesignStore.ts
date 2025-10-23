import { create } from 'zustand';

export interface Stand {
  id: number;
  name: string;
  price: number;
}

// 하드코딩된 거치대 목록 (프론트엔드 전용)
const STANDS: Stand[] = [
  { id: 1, name: "베이직 거치대", price: 5000 },
  { id: 2, name: "스탠다드 거치대", price: 8000 },
  { id: 3, name: "프리미엄 거치대", price: 12000 },
  { id: 4, name: "럭셔리 거치대", price: 18000 },
  { id: 5, name: "커스텀 거치대", price: 25000 },
];

// 개별 QR 판 설정
export interface QRPlateConfig {
  id: string;

  // QR 설정
  qrUrl: string;

  // 판 크기 (mm)
  plateWidth: number;
  plateHeight: number;
  plateDepth: number;

  // QR 상세 설정 (mm)
  qrSize: number;
  qrDepth: number;
  qrYOffset: number; // 판 상단에서 QR까지의 거리

  // 거치대
  standAngle: 90 | 95 | 100 | 105 | 110;

  // 색상
  plateColor: string;
  qrColor: string;

  // 상단 아치
  topArchRadius: number; // 0 = 평평

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
  qrUrl: 'https://example.com',
  plateWidth: 70,
  plateHeight: 100,
  plateDepth: 2,
  qrSize: 50,
  qrDepth: 2,
  qrYOffset: 10,
  standAngle: 100,
  plateColor,
  qrColor,
  topArchRadius: 0,
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
