/**
 * QR 유틸리티 통합 모듈
 *
 * 이 모듈은 QR 코드 관련 모든 기능을 제공합니다:
 * - QR 문자열 생성 (URL, WiFi, Email)
 * - QR 비트맵 생성
 * - QR 타입 헬퍼 함수
 */

// QR 문자열 생성 (generator.ts)
export {
  generateQRString,
  generateWiFiQR,
  generateEmailQR,
  type WiFiData,
  type EmailData,
} from './generator';

// QR 비트맵 생성 (bitmap.ts)
export { generateQRBitmap } from './bitmap';

// QR 타입 헬퍼 (helpers.ts)
export { getQRTypeLabel } from './helpers';
