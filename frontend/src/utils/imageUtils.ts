/**
 * 이미지 파일을 픽셀 비트맵 또는 부드러운 윤곽선으로 변환
 * 흰색 배경은 제거, 색상 있는 부분만 추출
 */

import * as MarchingSquares from 'marchingsquares';
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
 * 2D 윤곽선의 signed area 계산 (Shoelace formula)
 * @returns 양수: 시계 반대 방향(CCW), 음수: 시계 방향(CW)
 */
function getSignedArea(contour: number[][]): number {
  let area = 0;
  const n = contour.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += contour[i][0] * contour[j][1];
    area -= contour[j][0] * contour[i][1];
  }

  return area / 2;
}

/**
 * 윤곽선이 반시계 방향(CCW)인지 확인
 */
function isCCW(contour: number[][]): boolean {
  return getSignedArea(contour) > 0;
}

/**
 * 윤곽선을 반시계 방향(CCW)으로 정규화
 * THREE.js는 외곽선과 홀 모두 CCW를 기대
 */
function ensureCCW(contour: number[][]): number[][] {
  if (isCCW(contour)) {
    return contour;
  } else {
    // CW인 경우 순서 반전
    return [...contour].reverse();
  }
}

/**
 * Point-in-polygon 테스트 (Ray casting algorithm)
 * @returns true if point is inside polygon
 */
function isPointInPolygon(point: number[], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * 윤곽선의 중첩 레벨 계산 (Even-Odd Rule용)
 * @param contourIndex - 체크할 윤곽선 인덱스
 * @param allContours - 모든 윤곽선 배열
 * @returns 중첩 레벨 (0 = 최외곽, 1 = 홀, 2 = 홀 안의 도형, ...)
 */
function calculateNestingLevel(contourIndex: number, allContours: number[][][]): number {
  const targetContour = allContours[contourIndex];
  const testPoint = targetContour[0]; // 첫 번째 점으로 테스트

  let nestingLevel = 0;

  // 다른 모든 윤곽선에 대해 포함 여부 체크
  for (let i = 0; i < allContours.length; i++) {
    if (i === contourIndex) continue; // 자기 자신 제외

    const otherContour = allContours[i];
    if (isPointInPolygon(testPoint, otherContour)) {
      nestingLevel++;
    }
  }

  return nestingLevel;
}

/**
 * 홀의 직접 부모 윤곽선 찾기
 * @param holeIndex - 홀 윤곽선 인덱스
 * @param allContours - 모든 윤곽선 배열
 * @param nestingLevels - 각 윤곽선의 nesting level 배열
 * @returns 부모 윤곽선 인덱스 (없으면 -1)
 */
function findDirectParent(
  holeIndex: number,
  allContours: number[][][],
  nestingLevels: number[]
): number {
  const holeContour = allContours[holeIndex];
  const holeLevel = nestingLevels[holeIndex];
  const testPoint = holeContour[0];

  // 부모는 레벨이 정확히 1 작아야 함 (홀수 → 짝수)
  const parentLevel = holeLevel - 1;

  let smallestParent = -1;
  let smallestParentArea = Infinity;

  // 모든 후보 부모 중 가장 작은(직접 부모) 것 찾기
  for (let i = 0; i < allContours.length; i++) {
    if (i === holeIndex) continue;
    if (nestingLevels[i] !== parentLevel) continue; // 레벨이 정확히 1 작아야 함

    const candidateContour = allContours[i];

    // 홀이 후보 부모 안에 있는지 확인
    if (isPointInPolygon(testPoint, candidateContour)) {
      const candidateArea = Math.abs(getSignedArea(candidateContour));

      // 가장 작은 부모 = 직접 부모
      if (candidateArea < smallestParentArea) {
        smallestParentArea = candidateArea;
        smallestParent = i;
      }
    }
  }

  return smallestParent;
}

/**
 * 이미지 파일을 부드러운 윤곽선(Shape)으로 변환
 * Marching Squares 알고리즘 사용
 * @param imageFile - 사용자가 업로드한 이미지 파일
 * @param targetSize - 리샘플링 크기 (기본 400x400)
 * @param whiteThreshold - 흰색 판별 임계값 (0~255, 기본 250)
 * @returns ImageContours { shapes, width, height }
 */
export async function imageToContours(
  imageFile: File,
  targetSize: number = 400,
  whiteThreshold: number = 250
): Promise<ImageContours> {
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
          canvasHeight = Math.round(targetSize / aspectRatio);
        } else if (aspectRatio < 1) {
          canvasWidth = Math.round(targetSize * aspectRatio);
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // 픽셀 데이터 추출
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const pixels = imageData.data;

        // 2D 숫자 배열 생성 (Marching Squares용)
        // 1 = 흰색/투명, 0 = 색상 있음 (반대로!)
        const data: number[][] = [];

        for (let y = 0; y < canvasHeight; y++) {
          const row: number[] = [];

          for (let x = 0; x < canvasWidth; x++) {
            const index = (y * canvasWidth + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            const isWhiteOrTransparent = (
              (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) ||
              a === 0
            );

            // 반전: 흰색=1, 색상=0 (윤곽선이 색상 영역을 감싸도록)
            row.push(isWhiteOrTransparent ? 1 : 0);
          }

          data.push(row);
        }

        console.log('Image data array created:', { width: canvasWidth, height: canvasHeight });

        // Marching Squares로 윤곽선 추출
        // isoLines 함수는 threshold 값을 경계로 하는 윤곽선들을 반환
        const contours = MarchingSquares.isoLines(data, 0.5);

        console.log('Marching Squares result:', { contourCount: contours.length });

        // 모든 윤곽선을 CCW로 정규화 (THREE.js 요구사항)
        const normalizedContours = contours.map(contour => ensureCCW(contour));

        // === Even-Odd Rule 적용 ===
        // 1. 각 윤곽선의 nesting level 계산
        const nestingLevels = normalizedContours.map((_, i) =>
          calculateNestingLevel(i, normalizedContours)
        );

        console.log('Nesting levels:', nestingLevels);

        // 2. 윤곽선을 { 원본 인덱스, 윤곽선, 레벨, 면적 } 구조로 변환
        interface ContourData {
          index: number;
          contour: number[][];
          level: number;
          area: number;
        }

        const contourDataList: ContourData[] = normalizedContours.map((contour, i) => ({
          index: i,
          contour,
          level: nestingLevels[i],
          area: Math.abs(getSignedArea(contour)),
        }));

        // 3. 짝수 레벨(0, 2, 4...) = 실제 도형들 추출
        const shapeContours = contourDataList.filter(c => c.level % 2 === 0);
        console.log(`Found ${shapeContours.length} shapes (even levels)`);

        // 4. 홀수 레벨(1, 3, 5...) = 홀들 추출
        const holeContours = contourDataList.filter(c => c.level % 2 === 1);
        console.log(`Found ${holeContours.length} holes (odd levels)`);

        // 5. 각 Shape에 대해 해당하는 홀들 찾아서 매핑
        const shapes: THREE.Shape[] = [];

        for (const shapeData of shapeContours) {
          if (shapeData.contour.length < 3) continue;

          // Shape 생성
          const shape = new THREE.Shape();
          const shapePoints: THREE.Vector2[] = shapeData.contour.map(point =>
            new THREE.Vector2(
              point[0] - canvasWidth / 2,
              -(point[1] - canvasHeight / 2)
            )
          );

          // 첫 점으로 이동
          shape.moveTo(shapePoints[0].x, shapePoints[0].y);

          // Catmull-Rom 스플라인으로 부드러운 곡선 생성
          if (shapePoints.length >= 4) {
            const curve = new THREE.CatmullRomCurve3(
              shapePoints.map(p => new THREE.Vector3(p.x, p.y, 0)),
              true,
              'catmullrom',
              0.3
            );
            const curvePoints = curve.getPoints(shapePoints.length * 2);
            for (let i = 1; i < curvePoints.length; i++) {
              shape.lineTo(curvePoints[i].x, curvePoints[i].y);
            }
          } else {
            for (let i = 1; i < shapePoints.length; i++) {
              shape.lineTo(shapePoints[i].x, shapePoints[i].y);
            }
          }

          shape.closePath();

          // 이 Shape의 홀들 찾기 (직접 부모가 이 Shape인 홀수 레벨 윤곽선들)
          for (const holeData of holeContours) {
            const parentIndex = findDirectParent(
              holeData.index,
              normalizedContours,
              nestingLevels
            );

            if (parentIndex === shapeData.index) {
              // 이 홀의 부모가 현재 Shape임
              if (holeData.contour.length < 3) continue;

              const holePath = new THREE.Path();
              const holePoints: THREE.Vector2[] = holeData.contour.map(point =>
                new THREE.Vector2(
                  point[0] - canvasWidth / 2,
                  -(point[1] - canvasHeight / 2)
                )
              );

              holePath.moveTo(holePoints[0].x, holePoints[0].y);

              if (holePoints.length >= 4) {
                const holeCurve = new THREE.CatmullRomCurve3(
                  holePoints.map(p => new THREE.Vector3(p.x, p.y, 0)),
                  true,
                  'catmullrom',
                  0.3
                );
                const holeCurvePoints = holeCurve.getPoints(holePoints.length * 2);
                for (let i = 1; i < holeCurvePoints.length; i++) {
                  holePath.lineTo(holeCurvePoints[i].x, holeCurvePoints[i].y);
                }
              } else {
                for (let i = 1; i < holePoints.length; i++) {
                  holePath.lineTo(holePoints[i].x, holePoints[i].y);
                }
              }

              holePath.closePath();
              shape.holes.push(holePath);

              console.log(`Added hole (level ${holeData.level}) to shape (level ${shapeData.level})`);
            }
          }

          shapes.push(shape);
        }

        console.log(`Created ${shapes.length} THREE.Shape objects with Even-Odd Rule`);

        resolve({
          shapes,
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
