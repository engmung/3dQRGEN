import { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generateQRBitmap } from "../utils/qrUtils";
import { generateQRString } from "../utils/qrGenerator";
import { DIMENSIONS } from "../constants/dimensions";

interface UseQRGeometryParams {
  qrType: 'url' | 'wifi' | 'email';
  qrUrl: string;
  qrWifiData?: any;
  qrEmailData?: any;
  qrSize: number;
  qrThickness: number;
}

/**
 * QR 코드 Geometry 생성 커스텀 훅
 */
export const useQRGeometry = ({
  qrType,
  qrUrl,
  qrWifiData,
  qrEmailData,
  qrSize,
  qrThickness,
}: UseQRGeometryParams) => {
  const [qrBitmap, setQrBitmap] = useState<{
    data: boolean[][];
    size: number;
  } | null>(null);

  // QR Bitmap 생성 (타입에 따라 다른 문자열 생성)
  useEffect(() => {
    // QR 타입에 따라 문자열 생성
    let qrString = '';
    try {
      if (qrType === 'url') {
        qrString = generateQRString('url', qrUrl);
      } else if (qrType === 'wifi') {
        qrString = generateQRString('wifi', qrWifiData);
      } else if (qrType === 'email') {
        qrString = generateQRString('email', qrEmailData);
      }
    } catch (error) {
      console.error('QR string generation error:', error);
      setQrBitmap(null);
      return;
    }

    // 빈 문자열이면 QR 생성 안 함
    if (!qrString || qrString.trim() === '') {
      setQrBitmap(null);
      return;
    }

    generateQRBitmap(qrString)
      .then((bitmap) => setQrBitmap(bitmap))
      .catch((err) => console.error("QR bitmap generation error:", err));
  }, [qrType, qrUrl, qrWifiData, qrEmailData]);

  // QR 코드 3D 블록 생성 (입체)
  // 기본 두께 1mm로 생성하고, 나중에 scale로 조절
  const { baseGeometry, baseThickness } = useMemo(() => {
    if (!qrBitmap) return { baseGeometry: null, baseThickness: DIMENSIONS.GEOMETRY.BASE_THICKNESS };

    const { data, size } = qrBitmap;
    const qrSizeUnits = qrSize;
    const blockSize = qrSizeUnits / size; // QR 크기를 픽셀 수로 나눔
    const baseThickness = DIMENSIONS.GEOMETRY.BASE_THICKNESS;
    const geometries: THREE.BufferGeometry[] = [];

    // 각 검은 픽셀마다 작은 박스 생성
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y][x]) {
          // 검은 픽셀
          const boxGeo = new THREE.BoxGeometry(blockSize, blockSize, baseThickness);
          const boxMesh = new THREE.Mesh(boxGeo);

          // 중앙을 (0,0)으로 하는 좌표계
          const posX = (x - size / 2) * blockSize + blockSize / 2;
          const posY = -(y - size / 2) * blockSize - blockSize / 2;

          boxMesh.position.set(posX, posY, baseThickness / 2);
          boxMesh.updateMatrix();

          const clonedGeo = boxGeo.clone();
          clonedGeo.applyMatrix4(boxMesh.matrix);
          geometries.push(clonedGeo);
        }
      }
    }

    if (geometries.length === 0) return { baseGeometry: null, baseThickness };

    // 모든 박스를 하나의 지오메트리로 병합
    return { baseGeometry: mergeGeometries(geometries), baseThickness };
  }, [qrBitmap, qrSize]);

  // Z축 스케일 계산 (두께 조절)
  const zScale = qrThickness / baseThickness;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      baseGeometry?.dispose();
    };
  }, [baseGeometry]);

  return { baseGeometry, baseThickness, zScale };
};
