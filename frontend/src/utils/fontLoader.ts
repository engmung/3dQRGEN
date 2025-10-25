import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

// 폰트 캐시 (한 번 로드하면 재사용)
const fontCache = new Map<string, Font>();

// 사용 가능한 폰트 목록 (임시: Pretendard만)
export const AVAILABLE_FONTS = {
  'Pretendard-Regular': { name: 'Pretendard', label: 'Pretendard (한글/English)', file: 'Pretendard-Regular.ttf' },
} as const;

export type FontKey = keyof typeof AVAILABLE_FONTS;

/**
 * TTF 폰트를 로드하여 THREE.Font 객체로 변환
 * 한 번 로드한 폰트는 캐시에 저장하여 재사용
 */
export async function loadFont(fontKey: FontKey): Promise<Font> {
  // 캐시 확인
  if (fontCache.has(fontKey)) {
    return fontCache.get(fontKey)!;
  }

  const fontInfo = AVAILABLE_FONTS[fontKey];
  const ttfLoader = new TTFLoader();

  try {
    // TTF 파일 로드
    const fontData = await ttfLoader.loadAsync(`/fonts/${fontInfo.file}`);

    // THREE.Font 객체 생성
    const font = new Font(fontData);

    // 캐시에 저장
    fontCache.set(fontKey, font);

    console.log(`Font loaded: ${fontInfo.label}`);

    return font;
  } catch (error) {
    console.error(`Failed to load font: ${fontInfo.label}`, error);
    throw error;
  }
}

/**
 * 모든 폰트를 미리 로드 (옵션)
 */
export async function preloadAllFonts(): Promise<void> {
  const keys = Object.keys(AVAILABLE_FONTS) as FontKey[];

  await Promise.all(
    keys.map(key => loadFont(key).catch(err => {
      console.warn(`Failed to preload font ${key}:`, err);
    }))
  );

  console.log('All fonts preloaded');
}
