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

interface DesignStore {
  // 거치대 (STL 파일 기반)
  standAngle: number; // 각도 (90, 95, 100, 105, 110)
  setStandAngle: (angle: number) => void;

  // 거치대 디버그 위치/회전/스케일
  standPositionX: number;
  standPositionY: number;
  standPositionZ: number;
  standRotationX: number; // 라디안
  standRotationY: number;
  standRotationZ: number;
  standScale: number;
  setStandPositionX: (x: number) => void;
  setStandPositionY: (y: number) => void;
  setStandPositionZ: (z: number) => void;
  setStandRotationX: (x: number) => void;
  setStandRotationY: (y: number) => void;
  setStandRotationZ: (z: number) => void;
  setStandScale: (scale: number) => void;
  resetStandTransform: () => void;

  // QR 판 디버그 위치/회전
  qrPlatePositionX: number;
  qrPlatePositionY: number;
  qrPlatePositionZ: number;
  qrPlateRotationX: number;
  qrPlateRotationY: number;
  qrPlateRotationZ: number;
  setQrPlatePositionX: (x: number) => void;
  setQrPlatePositionY: (y: number) => void;
  setQrPlatePositionZ: (z: number) => void;
  setQrPlateRotationX: (x: number) => void;
  setQrPlateRotationY: (y: number) => void;
  setQrPlateRotationZ: (z: number) => void;
  resetQrPlateTransform: () => void;

  // QR URL
  qrUrl: string;
  setQrUrl: (url: string) => void;

  // 판 크기 (mm)
  plateWidth: number;
  plateHeight: number;
  plateDepth: number;
  setPlateWidth: (width: number) => void;
  setPlateHeight: (height: number) => void;
  setPlateDepth: (depth: number) => void;

  // QR 설정 (mm)
  qrSize: number;
  qrDepth: number;
  qrYOffset: number; // 판 상단에서 QR까지의 거리
  setQrSize: (size: number) => void;
  setQrDepth: (depth: number) => void;
  setQrYOffset: (offset: number) => void;

  // 색상 설정
  plateColor: string;
  qrColor: string;
  setPlateColor: (color: string) => void;
  setQrColor: (color: string) => void;

  // 상단 아치 설정
  topArchRadius: number; // 0 = 평평, 값이 클수록 둥글게
  setTopArchRadius: (radius: number) => void;
}

export const useDesignStore = create<DesignStore>((set) => ({
  // 기본값
  standAngle: 100,       // 100° 거치대 기본

  // 거치대 디버그 위치/회전/스케일 (초기값 0)
  standPositionX: 0,
  standPositionY: 0,
  standPositionZ: 0,
  standRotationX: 0,
  standRotationY: 0,
  standRotationZ: 0,
  standScale: 1.0,

  // QR 판 디버그 위치/회전 (초기값 0)
  qrPlatePositionX: 0,
  qrPlatePositionY: 0,
  qrPlatePositionZ: 0,
  qrPlateRotationX: 0,
  qrPlateRotationY: 0,
  qrPlateRotationZ: 0,

  qrUrl: 'https://example.com',
  plateWidth: 70,        // 핸드폰 너비
  plateHeight: 100,      // 핸드폰 높이
  plateDepth: 2,         // 판 두께
  qrSize: 50,            // QR 크기
  qrDepth: 2,            // QR 블록 높이
  qrYOffset: 10,         // 판 상단에서 10mm 아래
  plateColor: '#ffffff', // 흰색
  qrColor: '#000000',    // 검은색
  topArchRadius: 0,      // 상단 아치 (0 = 평평)

  // Setters
  setStandAngle: (angle) => set({ standAngle: angle }),
  setStandPositionX: (x) => set({ standPositionX: x }),
  setStandPositionY: (y) => set({ standPositionY: y }),
  setStandPositionZ: (z) => set({ standPositionZ: z }),
  setStandRotationX: (x) => set({ standRotationX: x }),
  setStandRotationY: (y) => set({ standRotationY: y }),
  setStandRotationZ: (z) => set({ standRotationZ: z }),
  setStandScale: (scale) => set({ standScale: scale }),
  resetStandTransform: () => set({
    standPositionX: 0,
    standPositionY: 0,
    standPositionZ: 0,
    standRotationX: 0,
    standRotationY: 0,
    standRotationZ: 0,
    standScale: 1.0,
  }),
  setQrPlatePositionX: (x) => set({ qrPlatePositionX: x }),
  setQrPlatePositionY: (y) => set({ qrPlatePositionY: y }),
  setQrPlatePositionZ: (z) => set({ qrPlatePositionZ: z }),
  setQrPlateRotationX: (x) => set({ qrPlateRotationX: x }),
  setQrPlateRotationY: (y) => set({ qrPlateRotationY: y }),
  setQrPlateRotationZ: (z) => set({ qrPlateRotationZ: z }),
  resetQrPlateTransform: () => set({
    qrPlatePositionX: 0,
    qrPlatePositionY: 0,
    qrPlatePositionZ: 0,
    qrPlateRotationX: 0,
    qrPlateRotationY: 0,
    qrPlateRotationZ: 0,
  }),
  setQrUrl: (url) => set({ qrUrl: url }),
  setPlateWidth: (width) => set({ plateWidth: width }),
  setPlateHeight: (height) => set({ plateHeight: height }),
  setPlateDepth: (depth) => set({ plateDepth: depth }),
  setQrSize: (size) => set({ qrSize: size }),
  setQrDepth: (depth) => set({ qrDepth: depth }),
  setQrYOffset: (offset) => set({ qrYOffset: offset }),
  setPlateColor: (color) => set({ plateColor: color }),
  setQrColor: (color) => set({ qrColor: color }),
  setTopArchRadius: (radius) => set({ topArchRadius: radius }),
}));
