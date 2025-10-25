/**
 * Pixel data processing utilities
 */

import * as THREE from 'three';

export interface PixelMap {
  data: boolean[][];  // 2D 배열: true = 색상 있음, false = 흰색/투명
  width: number;      // 픽셀 너비
  height: number;     // 픽셀 높이
}

export interface ImageContours {
  shapes: THREE.Shape[];  // 부드러운 윤곽선들 (여러 개 가능)
  width: number;
  height: number;
}

/**
 * 이미지 파일을 픽셀 비트맵으로 변환 (레거시)
 * @param imageFile - 사용자가 업로드한 이미지 파일
 * @param targetSize - 리샘플링 크기 (정사각형, 기본 100x100)
 * @param whiteThreshold - 흰색 판별 임계값 (0~255, 기본 250)
 * @returns PixelMap { data, width, height }
 */
export async function imageToPixelMap(
  imageFile: File,
  targetSize: number = 100,
  whiteThreshold: number = 250
): Promise<PixelMap> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Canvas 생성
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 이미지 비율 유지하면서 리샘플링
        const aspectRatio = img.width / img.height;
        let canvasWidth = targetSize;
        let canvasHeight = targetSize;

        if (aspectRatio > 1) {
          // 가로가 더 긴 이미지
          canvasHeight = Math.round(targetSize / aspectRatio);
        } else if (aspectRatio < 1) {
          // 세로가 더 긴 이미지
          canvasWidth = Math.round(targetSize * aspectRatio);
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 이미지를 Canvas에 그리기 (리샘플링)
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // 픽셀 데이터 추출
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const pixels = imageData.data; // Uint8ClampedArray [R, G, B, A, R, G, B, A, ...]

        // 2D boolean 배열 생성
        const pixelMap: boolean[][] = [];

        for (let y = 0; y < canvasHeight; y++) {
          const row: boolean[] = [];

          for (let x = 0; x < canvasWidth; x++) {
            const index = (y * canvasWidth + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            // 흰색 판별:
            // - RGB 모두 임계값 이상이면 흰색 (false)
            // - 알파가 0이면 투명 (false)
            // - 그 외: 색상 있음 (true)
            const isWhiteOrTransparent = (
              (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) ||
              a === 0
            );

            row.push(!isWhiteOrTransparent);
          }

          pixelMap.push(row);
        }

        resolve({
          data: pixelMap,
          width: canvasWidth,
          height: canvasHeight,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(imageFile);
  });
}

/**
 * 이미지 파일을 Base64 Data URL로 변환 (미리보기용)
 */
export async function imageFileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
