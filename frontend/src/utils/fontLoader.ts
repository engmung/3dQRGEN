import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

// 폰트 캐시 (한 번 로드하면 재사용)
const fontCache = new Map<string, Font>();

// Promise 캐시 (동시 요청 방지)
const fontLoadingPromises = new Map<string, Promise<Font>>();

// 사용 가능한 폰트 목록 (임시: Pretendard만)
export const AVAILABLE_FONTS = {
  'Pretendard-Regular': { name: 'Pretendard', label: 'Pretendard (한글/English)', file: 'Pretendard-Regular.ttf' },
} as const;

export type FontKey = keyof typeof AVAILABLE_FONTS;

/**
 * TTF 폰트를 로드하여 THREE.Font 객체로 변환
 * 한 번 로드한 폰트는 캐시에 저장하여 재사용
 * 동시 요청 시 같은 Promise를 재사용하여 중복 로딩 방지
 */
export async function loadFont(fontKey: FontKey, retries: number = 3): Promise<Font> {
  // 1. 캐시 확인 (이미 로드된 폰트)
  if (fontCache.has(fontKey)) {
    return fontCache.get(fontKey)!;
  }

  // 2. 로딩 중인 Promise 확인 (동시 요청 방지)
  if (fontLoadingPromises.has(fontKey)) {
    return fontLoadingPromises.get(fontKey)!;
  }

  const fontInfo = AVAILABLE_FONTS[fontKey];
  const ttfLoader = new TTFLoader();

  // 3. 새로운 로딩 Promise 생성
  const loadingPromise = (async () => {
    let lastError: Error | null = null;

    // 재시도 로직
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Font Loader] Loading ${fontInfo.label} (attempt ${attempt}/${retries})...`);

        // TTF 파일 로드
        const fontData = await ttfLoader.loadAsync(`/fonts/${fontInfo.file}`);

        // THREE.Font 객체 생성
        const font = new Font(fontData);

        // 캐시에 저장
        fontCache.set(fontKey, font);

        // 로딩 Promise 제거
        fontLoadingPromises.delete(fontKey);

        console.log(`✅ Font loaded: ${fontInfo.label}`);

        return font;
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Font load failed (attempt ${attempt}/${retries}): ${fontInfo.label}`, error);

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // 지수 백오프
        }
      }
    }

    // 모든 재시도 실패
    fontLoadingPromises.delete(fontKey);
    throw new Error(`Failed to load font after ${retries} attempts: ${fontInfo.label}`, { cause: lastError });
  })();

  // Promise 캐시에 저장
  fontLoadingPromises.set(fontKey, loadingPromise);

  return loadingPromise;
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
