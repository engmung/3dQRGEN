/**
 * Image contour extraction and conversion to THREE.js shapes
 */

import * as THREE from 'three';
import { extractContours } from './marchingSquares';
import {
  getSignedArea,
  isCCW,
  ensureCCW,
  isPointInPolygon,
  calculateNestingLevel,
  findDirectParent,
} from './polygon';

export interface ImageContours {
  shapes: THREE.Shape[];  // 부드러운 윤곽선들 (여러 개 가능)
  width: number;
  height: number;
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

        // Marching Squares로 윤곽선 추출
        const contours = extractContours(data, 0.5);

        // 모든 윤곽선을 CCW로 정규화 (THREE.js 요구사항)
        const normalizedContours = contours.map(contour => ensureCCW(contour));

        // === Even-Odd Rule 적용 ===
        // 1. 각 윤곽선의 nesting level 계산
        const nestingLevels = normalizedContours.map((_, i) =>
          calculateNestingLevel(i, normalizedContours)
        );

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

        // 4. 홀수 레벨(1, 3, 5...) = 홀들 추출
        const holeContours = contourDataList.filter(c => c.level % 2 === 1);

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

              // 홀의 winding order를 CW로 변환 (측면 노멀이 바깥쪽을 향하도록)
              holePoints.reverse();

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
            }
          }

          shapes.push(shape);
        }

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
