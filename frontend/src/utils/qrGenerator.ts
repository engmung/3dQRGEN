/**
 * QR 코드 생성 유틸리티
 * 다양한 QR 타입(URL, WiFi, Email)에 대한 문자열 생성 함수 제공
 *
 * @deprecated 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새 코드에서는 './qr' 모듈을 직접 import 하세요.
 */

export {
  generateQRString,
  generateWiFiQR,
  generateEmailQR,
  type WiFiData,
  type EmailData,
} from './qr/generator';
