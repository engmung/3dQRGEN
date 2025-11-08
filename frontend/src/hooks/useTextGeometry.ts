import { useState, useEffect } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { loadFont, type FontKey } from "../utils/fontLoader";
import { DIMENSIONS } from "../constants/dimensions";

interface UseTextGeometryParams {
  text: string;
  textFont: string;
  textSize: number;
  qrThickness: number; // 텍스트는 QR 두께와 공유
}

/**
 * 텍스트 Geometry 생성 커스텀 훅 (비동기 폰트 로딩)
 */
export const useTextGeometry = ({
  text,
  textFont,
  textSize,
  qrThickness,
}: UseTextGeometryParams) => {
  const [textGeometry, setTextGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!text || text.trim() === '') {
      setTextGeometry(null);
      return;
    }

    let isCancelled = false;

    loadFont(textFont as FontKey)
      .then((font) => {
        if (isCancelled) return;

        const geometry = new TextGeometry(text, {
          font: font,
          size: textSize,
          depth: qrThickness, // QR 두께와 공유!
          curveSegments: DIMENSIONS.GEOMETRY.CURVE_SEGMENTS,
          bevelEnabled: false,
        });

        // 중앙 정렬
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const centerOffsetX = -(bbox.max.x - bbox.min.x) / 2;
        geometry.translate(centerOffsetX, 0, 0);

        setTextGeometry(geometry);
      })
      .catch((err) => {
        console.error("Text geometry generation error:", err);
        setTextGeometry(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [text, textFont, textSize, qrThickness]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      textGeometry?.dispose();
    };
  }, [textGeometry]);

  return textGeometry;
};
