import type { WiFiData, EmailData } from '../utils/qrGenerator';

// QR 타입 정의
export type QRType = 'url' | 'wifi' | 'email';

// 제품 타입 정의
export type ProductType = 'stand' | 'card';

// 명함 모서리 스타일
export type CardCornerStyle = 'sharp' | 'rounded' | 'chamfered';

// 이미지 설정 (저장용 - Base64)
export interface ImageConfigStored {
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

// 텍스트 설정
export interface TextConfig {
  id: string;
  content: string;            // 텍스트 내용
  font: string;               // 폰트명
  size: number;               // 텍스트 크기 (mm)
  heightOffset: number;       // 텍스트 높이 오프셋 (upVector 방향, mm)
  horizontalOffset: number;   // 텍스트 좌우 오프셋 (rightVector 방향, mm)
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
  cardCornerStyle: CardCornerStyle; // 모서리 스타일 (기본: 'sharp')
  cardCornerRadius: number; // 둥글게/챔퍼 크기 (mm, 기본: 2)

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

  // 텍스트 설정 (배열로 변경)
  texts: TextConfig[];

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

// UUID 생성 폴리필 (crypto.randomUUID가 없는 환경용)
export function generateUUID(): string {
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

// 기본 QR 판 설정 생성
export const createDefaultPlate = (
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
  cardThickness: 1.2,      // 명함 두께 (기본: 1.2mm)
  cardCornerStyle: 'sharp', // 모서리 스타일 (기본: 뾰족하게)
  cardCornerRadius: 2,     // 둥글게/챔퍼 크기 (기본: 2mm)
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
  texts: [],               // 기본 텍스트 없음 (빈 배열)
  images: [],              // 기본 이미지 없음 (빈 배열)
  plateColor,
  qrColor, // QR, 텍스트, 이미지 색상 공용
  quantity: 1,             // 기본 수량 1개
  // 새 판은 X축으로 간격을 두고 배치
  positionX: index * 120,
  positionY: 0,
  positionZ: 0,
});
