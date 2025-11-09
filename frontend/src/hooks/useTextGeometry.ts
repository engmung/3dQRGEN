import { useState, useEffect } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { loadFont, type FontKey } from "../utils/fontLoader";
import { DIMENSIONS } from "../constants/dimensions";
import type { TextConfig } from "../types/design";

interface UseTextGeometriesParams {
  texts: TextConfig[];
  qrThickness: number; // zScale 계산용 (실제 사용 안 함)
}

export interface TextGeometryResult {
  id: string;
  geometry: THREE.BufferGeometry;
  config: TextConfig;
}

/**
 * 다중 텍스트 Geometry 생성 커스텀 훅 (비동기 폰트 로딩)
 */
export const useTextGeometries = ({
  texts,
  qrThickness,
}: UseTextGeometriesParams): TextGeometryResult[] => {
  const [textGeometries, setTextGeometries] = useState<TextGeometryResult[]>([]);

  useEffect(() => {
    let isCancelled = false;
    const geometries: TextGeometryResult[] = [];

    // Filter out empty texts
    const validTexts = texts.filter(txt => txt.content && txt.content.trim() !== '');

    if (validTexts.length === 0) {
      setTextGeometries([]);
      return;
    }

    // Load all text geometries
    Promise.all(
      validTexts.map(async (textConfig) => {
        try {
          const font = await loadFont(textConfig.font as FontKey);
          if (isCancelled) return null;

          const geometry = new TextGeometry(textConfig.content, {
            font: font,
            size: textConfig.size,
            depth: DIMENSIONS.GEOMETRY.BASE_THICKNESS, // 1mm (이미지와 동일, 나중에 zScale로 조절)
            curveSegments: DIMENSIONS.GEOMETRY.CURVE_SEGMENTS,
            bevelEnabled: false,
          });

          // 중앙 정렬 (X축만, 이미지와 동일)
          geometry.computeBoundingBox();
          const bbox = geometry.boundingBox!;
          const centerOffsetX = -(bbox.max.x - bbox.min.x) / 2;

          geometry.translate(centerOffsetX, 0, 0);

          return {
            id: textConfig.id,
            geometry,
            config: textConfig,
          };
        } catch (err) {
          console.error(`Text geometry generation error for text ${textConfig.id}:`, err);
          return null;
        }
      })
    ).then((results) => {
      if (isCancelled) return;
      const validResults = results.filter(r => r !== null) as TextGeometryResult[];
      setTextGeometries(validResults);
    });

    return () => {
      isCancelled = true;
    };
  }, [texts, qrThickness]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      textGeometries.forEach(({ geometry }) => geometry.dispose());
    };
  }, [textGeometries]);

  return textGeometries;
};
