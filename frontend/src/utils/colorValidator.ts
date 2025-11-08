/**
 * 색상 조합 검증 유틸리티
 * ColorPalette 로직에서 추출
 */

export interface ColorInfo {
  name: string;
  value: string;
}

export interface ColorCombination {
  colors: string[];
}

/**
 * 색상 조합이 허용되는지 확인
 * @param plateColor 판 색상
 * @param qrColor QR 색상
 * @param allowedCombinations 허용된 색상 조합 목록
 * @returns 조합 허용 여부
 */
export function isCombinationAllowed(
  plateColor: string,
  qrColor: string,
  allowedCombinations: ColorCombination[]
): boolean {
  // 같은 색상은 불가 (대소문자 무시)
  if (plateColor.toUpperCase() === qrColor.toUpperCase()) return false;

  // 대소문자 무시하고 비교
  const plateUpper = plateColor.toUpperCase();
  const qrUpper = qrColor.toUpperCase();

  return allowedCombinations.some(combo =>
    combo.colors.length === 2 &&
    combo.colors.some(c => c.toUpperCase() === plateUpper) &&
    combo.colors.some(c => c.toUpperCase() === qrUpper)
  );
}

/**
 * 색상이 출력 가능한지 확인 (허용된 색상 목록에 포함되는지)
 * @param color 확인할 색상
 * @param availableColors 사용 가능한 색상 목록
 * @returns 색상 사용 가능 여부
 */
export function isColorAvailable(
  color: string,
  availableColors: ColorInfo[]
): boolean {
  const colorUpper = color.toUpperCase();
  return availableColors.some(c => c.value.toUpperCase() === colorUpper);
}

/**
 * 기본 색상 팔레트 (API 로드 실패 시 사용)
 */
export const DEFAULT_COLORS: ColorInfo[] = [
  { name: '검정', value: '#000000' },
  { name: '흰색', value: '#FFFFFF' },
  { name: '핑크', value: '#FF69B4' },
];

/**
 * 기본 색상 조합 (API 로드 실패 시 사용)
 */
export const DEFAULT_COMBINATIONS: ColorCombination[] = [
  { colors: ['#FFFFFF', '#000000'] },
  { colors: ['#FF69B4', '#000000'] },
];
