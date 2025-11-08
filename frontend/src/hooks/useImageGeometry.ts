import { useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { imageToContours, type ImageContours } from "../utils/imageUtils/index";
import { DIMENSIONS } from "../constants/dimensions";

interface ImageConfig {
  file: File;
  size: number;
  heightOffset: number;
  horizontalOffset: number;
}

interface UseImageGeometryParams {
  images: ImageConfig[];
  qrThickness: number;
}

/**
 * 이미지 Geometry 생성 커스텀 훅 (비동기, Marching Squares) - 여러 이미지 지원
 */
export const useImageGeometry = ({
  images,
  qrThickness,
}: UseImageGeometryParams) => {
  const [imageContoursArray, setImageContoursArray] = useState<(ImageContours | null)[]>([]);

  // 이미지 Contours 생성
  useEffect(() => {
    if (images.length === 0) {
      setImageContoursArray([]);
      return;
    }

    let isCancelled = false;

    // 모든 이미지를 병렬로 처리
    Promise.all(
      images.map((img) =>
        imageToContours(img.file, DIMENSIONS.IMAGE.CONTOUR_RESOLUTION).catch((err) => {
          console.error("Image contour extraction error:", err);
          return null;
        })
      )
    ).then((contours) => {
      if (isCancelled) return;
      setImageContoursArray(contours);
    });

    return () => {
      isCancelled = true;
    };
  }, [images]);

  // 이미지 3D geometry 생성 (부드러운 ExtrudeGeometry) - 여러 이미지 지원
  const imageGeometriesArray = useMemo(() => {
    if (imageContoursArray.length === 0) return [];

    return imageContoursArray.map((imageContours, index) => {
      if (!imageContours || imageContours.shapes.length === 0) return null;

      const { shapes, width, height } = imageContours;
      const imageSizeUnits = images[index]?.size || DIMENSIONS.IMAGE.DEFAULT_SIZE;

      // 스케일 계산 (픽셀 좌표 → mm 단위)
      const scaleX = imageSizeUnits / width;
      const scaleY = imageSizeUnits / height;

      // ExtrudeGeometry 설정 (baseThickness 사용)
      const extrudeSettings = {
        depth: DIMENSIONS.GEOMETRY.BASE_THICKNESS, // 1mm (나중에 zScale로 조절)
        bevelEnabled: false,
        curveSegments: DIMENSIONS.GEOMETRY.CURVE_SEGMENTS,
      };

      // 각 Shape를 ExtrudeGeometry로 변환
      const geometries: THREE.BufferGeometry[] = [];

      for (const shape of shapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // 스케일 적용 (픽셀 좌표 → mm)
        geometry.scale(scaleX, scaleY, 1);

        geometries.push(geometry);
      }

      if (geometries.length === 0) return null;

      // 모든 윤곽선을 하나의 지오메트리로 병합
      return mergeGeometries(geometries);
    });
  }, [imageContoursArray, images, qrThickness]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imageGeometriesArray?.forEach(geo => geo?.dispose());
    };
  }, [imageGeometriesArray]);

  return imageGeometriesArray;
};
