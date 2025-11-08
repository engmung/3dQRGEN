/**
 * OBJ Export 로직 커스텀 훅
 * HomeDebug.tsx에서 추출
 */

import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { QRPlateConfig } from '../store/useDesignStore';
import { exportCollectedMeshesToOBJ } from '../utils/objExporter';
import {
  collectGLBMeshes,
  collectQRGeometries,
  collectBusinessCardMeshes,
  applyGlobalRotation,
  alignToGround,
} from '../utils/meshCollector';

interface UseOBJExportParams {
  gltfs: {
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  } | null;
  objTransforms: {
    backTransform: any;
    brigeTransform: any;
    frontTransform: any;
    pinTransform: any;
    globalRotation: any;
  };
}

type QRGeometries = {
  qr: THREE.BufferGeometry | null;
  text: THREE.BufferGeometry | null;
  image: THREE.BufferGeometry | null;
  images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
  qrPosition: THREE.Vector3;
  qrQuaternion: THREE.Quaternion;
  textPosition: THREE.Vector3 | null;
  textQuaternion: THREE.Quaternion | null;
  imagePosition: THREE.Vector3 | null;
  imageQuaternion: THREE.Quaternion | null;
  qrColor: string;
  zScale: number;
};

export function useOBJExport(params: UseOBJExportParams) {
  const { gltfs, objTransforms } = params;

  /**
   * 단일 plate를 OBJ로 Export
   */
  const exportSinglePlate = (
    plate: QRPlateConfig,
    plateGeometries: QRGeometries | undefined,
    plateIndex: number
  ) => {
    // 거치대 모드일 때만 GLB 체크
    if (plate.productType === 'stand' && !gltfs) {
      alert('GLB 파츠가 아직 로드되지 않았습니다.');
      return;
    }

    if (!plateGeometries) {
      alert('3D 모델이 아직 로드되지 않았습니다.');
      return;
    }

    try {
      // 1. 메시 수집
      let allMeshes: any[] = [];

      if (plate.productType === 'card') {
        // 명함 모드
        const emptyTransform = {
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };

        allMeshes.push(
          ...collectBusinessCardMeshes(
            plate.cardWidth,
            plate.cardHeight,
            plate.cardThickness,
            plate.plateColor,
            plateGeometries.qr,
            plateGeometries.texts || [],
            plateGeometries.images,
            plateGeometries.qrPosition,
            plateGeometries.qrQuaternion,
            plateGeometries.qrColor,
            plateGeometries.zScale,
            emptyTransform
          )
        );
      } else {
        // 거치대 모드
        if (!gltfs) return;

        allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', objTransforms.backTransform, plate.plateColor, true));
        allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', objTransforms.brigeTransform, plate.plateColor));
        allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', objTransforms.frontTransform, plate.plateColor));
        allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', objTransforms.pinTransform, plate.plateColor));

        // QR/텍스트/이미지 추가
        allMeshes.push(
          ...collectQRGeometries(
            plateGeometries.qr,
            plateGeometries.text,
            plateGeometries.images,
            plateGeometries.qrPosition,
            plateGeometries.qrQuaternion,
            plateGeometries.textPosition,
            plateGeometries.textQuaternion,
            plateGeometries.qrColor,
            plateGeometries.zScale,
            objTransforms.frontTransform
          )
        );
      }

      // 2. Global rotation 적용
      allMeshes = applyGlobalRotation(allMeshes, objTransforms.globalRotation);

      // 3. 바닥면 정렬
      allMeshes = alignToGround(allMeshes);

      // 4. Export
      exportCollectedMeshesToOBJ(allMeshes, `3d_qr_plate_${plateIndex}`);
    } catch (error) {
      console.error('OBJ export failed:', error);
      alert('OBJ export에 실패했습니다.');
    }
  };

  /**
   * 모든 plate를 개별 파일로 Export
   */
  const exportAllPlates = (
    plates: QRPlateConfig[],
    qrGeometriesMap: Map<string, QRGeometries>
  ) => {
    // 거치대가 있는지 확인
    const hasStand = plates.some(plate => plate.productType === 'stand');
    if (hasStand && !gltfs) {
      alert('GLB 파츠가 아직 로드되지 않았습니다.');
      return;
    }

    alert(`${plates.length}개의 판을 개별 파일로 다운로드합니다.\n각 판마다 plate_1.obj, plate_2.obj... 형식으로 저장됩니다.`);

    // 각 plate마다 순회하며 export
    plates.forEach((plate, index) => {
      const plateGeometries = qrGeometriesMap.get(plate.id);
      if (!plateGeometries) {
        console.warn(`Plate ${plate.id} geometries not ready, skipping...`);
        return;
      }

      try {
        // 1. 메시 수집
        let allMeshes: any[] = [];

        if (plate.productType === 'card') {
          // 명함 모드
          const emptyTransform = {
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
          };

          allMeshes.push(
            ...collectBusinessCardMeshes(
              plate.cardWidth,
              plate.cardHeight,
              plate.cardThickness,
              plate.plateColor,
              plateGeometries.qr,
              plateGeometries.texts || [],
              plateGeometries.images,
              plateGeometries.qrPosition,
              plateGeometries.qrQuaternion,
              plateGeometries.qrColor,
              plateGeometries.zScale,
              emptyTransform
            )
          );
        } else {
          // 거치대 모드
          if (!gltfs) return;

          allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', objTransforms.backTransform, plate.plateColor, true));
          allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', objTransforms.brigeTransform, plate.plateColor));
          allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', objTransforms.frontTransform, plate.plateColor));
          allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', objTransforms.pinTransform, plate.plateColor));

          // QR/텍스트/이미지 추가
          allMeshes.push(
            ...collectQRGeometries(
              plateGeometries.qr,
              plateGeometries.text,
              plateGeometries.images,
              plateGeometries.qrPosition,
              plateGeometries.qrQuaternion,
              plateGeometries.textPosition,
              plateGeometries.textQuaternion,
              plateGeometries.qrColor,
              plateGeometries.zScale,
              objTransforms.frontTransform
            )
          );
        }

        // 2. Global rotation 적용
        allMeshes = applyGlobalRotation(allMeshes, objTransforms.globalRotation);

        // 3. 바닥면 정렬
        allMeshes = alignToGround(allMeshes);

        // 4. Export
        exportCollectedMeshesToOBJ(allMeshes, `plate_${index + 1}`);
      } catch (error) {
        console.error(`Plate ${index + 1} export failed:`, error);
      }
    });
  };

  return {
    exportSinglePlate,
    exportAllPlates,
  };
}
