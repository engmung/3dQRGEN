import { create } from 'zustand';
import type { Stand } from '../utils/api';

interface DesignStore {
  // 거치대
  standId: number;
  stands: Stand[];
  setStandId: (id: number) => void;
  setStands: (stands: Stand[]) => void;

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
}

export const useDesignStore = create<DesignStore>((set) => ({
  // 기본값
  standId: 1,       // 기본 거치대 (70mm)
  stands: [],
  qrUrl: 'https://example.com',
  plateWidth: 70,  // 핸드폰 너비
  plateHeight: 140, // 핸드폰 높이
  plateDepth: 2,    // 판 두께
  qrSize: 50,       // QR 크기
  qrDepth: 2,       // QR 블록 높이
  qrYOffset: 10,    // 판 상단에서 10mm 아래

  // Setters
  setStandId: (id) => set({ standId: id }),
  setStands: (stands) => set({ stands }),
  setQrUrl: (url) => set({ qrUrl: url }),
  setPlateWidth: (width) => set({ plateWidth: width }),
  setPlateHeight: (height) => set({ plateHeight: height }),
  setPlateDepth: (depth) => set({ plateDepth: depth }),
  setQrSize: (size) => set({ qrSize: size }),
  setQrDepth: (depth) => set({ qrDepth: depth }),
  setQrYOffset: (offset) => set({ qrYOffset: offset }),
}));
