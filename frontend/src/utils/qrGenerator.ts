/**
 * QR 코드 생성 유틸리티
 * 다양한 QR 타입(URL, WiFi, Email)에 대한 문자열 생성 함수 제공
 */

export interface WiFiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
}

export interface EmailData {
  recipient: string;
  subject: string;
  body: string;
}

/**
 * WiFi QR 코드 포맷용 특수문자 이스케이프
 * : \ ; , " 문자 앞에 백슬래시 추가
 */
function escapeWiFiString(str: string): string {
  return str.replace(/([:\\;,"])/g, '\\$1');
}

/**
 * WiFi QR 코드 문자열 생성
 * 형식: WIFI:S:{ssid};T:{security};P:{password};;
 *
 * @param data - WiFi 데이터 (SSID, 비밀번호, 보안 타입)
 * @returns WiFi QR 코드 문자열
 *
 * @example
 * generateWiFiQR({ ssid: 'MyWiFi', password: 'pass123', security: 'WPA' })
 * // => 'WIFI:S:MyWiFi;T:WPA;P:pass123;;'
 */
export function generateWiFiQR(data: WiFiData): string {
  const { ssid, password, security } = data;

  // 비밀번호가 없으면 보안 타입을 nopass로 설정
  const actualSecurity = password === '' ? 'nopass' : security;
  const actualPassword = actualSecurity === 'nopass' ? '' : password;

  return `WIFI:S:${escapeWiFiString(ssid)};T:${escapeWiFiString(actualSecurity)};P:${escapeWiFiString(actualPassword)};;`;
}

/**
 * Email QR 코드 문자열 생성
 * 형식: mailto:{recipient}?subject={subject}&body={body}
 *
 * @param data - Email 데이터 (수신자, 제목, 본문)
 * @returns Email QR 코드 문자열
 *
 * @example
 * generateEmailQR({ recipient: 'test@example.com', subject: 'Hello', body: 'Message' })
 * // => 'mailto:test@example.com?subject=Hello&body=Message'
 */
export function generateEmailQR(data: EmailData): string {
  const { recipient, subject, body } = data;

  // 여러 수신자 처리 (쉼표로 구분된 이메일)
  const recipients = recipient
    .split(',')
    .map((email) => email.trim())
    .join(',');

  // URL 인코딩
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  return `mailto:${recipients}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * QR 타입에 따른 문자열 생성
 *
 * @param type - QR 타입 ('url' | 'wifi' | 'email')
 * @param data - 타입별 데이터 (URL 문자열, WiFiData, EmailData)
 * @returns QR 코드 문자열
 */
export function generateQRString(
  type: 'url',
  data: string
): string;
export function generateQRString(
  type: 'wifi',
  data: WiFiData
): string;
export function generateQRString(
  type: 'email',
  data: EmailData
): string;
export function generateQRString(
  type: 'url' | 'wifi' | 'email',
  data: string | WiFiData | EmailData
): string {
  switch (type) {
    case 'url':
      return data as string;
    case 'wifi':
      return generateWiFiQR(data as WiFiData);
    case 'email':
      return generateEmailQR(data as EmailData);
    default:
      return '';
  }
}
