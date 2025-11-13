/**
 * 장바구니 아이템으로부터 OBJ/MTL Blob 생성
 */

import type { CartItem } from '../store/useCartStore';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  collectGLBMeshes,
  collectQRGeometries,
  collectBusinessCardMeshes,
  applyGlobalRotation,
  alignToGround,
} from './meshCollector';
import type { CollectedMesh } from '../types/mesh';
import type { Transform } from '../store/objPreviewStore';
import { generateOBJString, generateMTLString, createOBJBlob } from './obj/objExport';

interface OBJBlobs {
  modelObjBlob: Blob;
  modelMtlBlob: Blob;
}

interface GLTFs {
  back: GLTF;
  brige: GLTF;
  front: GLTF;
  pin: GLTF;
}

interface Transforms {
  backTransform: Transform;
  brigeTransform: Transform;
  frontTransform: Transform;
  pinTransform: Transform;
  globalRotation: [number, number, number];
}

/**
 * 장바구니 아이템으로부터 OBJ/MTL Blob 생성
 *
 * @param item - 장바구니 아이템
 * @param gltfs - GLB 파츠 데이터
 * @param transforms - OBJ 변환 설정
 * @returns OBJ/MTL Blob들
 */
export async function generateOBJFromCartItem(
  item: CartItem,
  gltfs: GLTFs,
  transforms: Transforms
): Promise<OBJBlobs> {
  try {
    let allMeshes: CollectedMesh[] = [];

    // 제품 타입에 따라 분기
    if (item.plateConfig.productType === 'card') {
      // 명함 모드 (이미 회전되어 있으므로 빈 transform 사용)
      if (item.geometries) {
        const emptyTransform = {
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };

        allMeshes.push(
          ...collectBusinessCardMeshes(
            item.plateConfig.cardWidth,
            item.plateConfig.cardHeight,
            item.plateConfig.cardThickness,
            item.plateConfig.plateColor,
            item.geometries.qr,
            item.geometries.texts || [],
            item.geometries.images,
            item.geometries.qrPosition,
            item.geometries.qrQuaternion,
            item.geometries.qrColor,
            item.geometries.zScale,
            item.plateConfig.cardCornerStyle ?? 'sharp',
            item.plateConfig.cardCornerRadius ?? 2,
            emptyTransform
          )
        );
      }
    } else {
      // 거치대 모드 (기존 로직)
      // 1. GLB 메시 수집
      allMeshes.push(...collectGLBMeshes(gltfs.back, 'back', transforms.backTransform, item.plateConfig.plateColor, true));
      allMeshes.push(...collectGLBMeshes(gltfs.brige, 'brige', transforms.brigeTransform, item.plateConfig.plateColor));
      allMeshes.push(...collectGLBMeshes(gltfs.front, 'front', transforms.frontTransform, item.plateConfig.plateColor));
      allMeshes.push(...collectGLBMeshes(gltfs.pin, 'pin', transforms.pinTransform, item.plateConfig.plateColor));

      // 2. QR/텍스트/이미지 추가
      if (item.geometries) {
        allMeshes.push(
          ...collectQRGeometries(
            item.geometries.qr,
            item.geometries.texts || [],
            item.geometries.images,
            item.geometries.qrPosition,
            item.geometries.qrQuaternion,
            item.geometries.qrColor,
            item.geometries.zScale,
            transforms.frontTransform
          )
        );
      }
    }

    // 3. 변환 적용
    allMeshes = applyGlobalRotation(allMeshes, transforms.globalRotation);
    allMeshes = alignToGround(allMeshes);

    // 4. 공통 모듈 사용하여 OBJ/MTL 생성
    const objString = generateOBJString(allMeshes, 'model');
    const mtlString = generateMTLString(allMeshes, 'model');
    const { objBlob, mtlBlob } = createOBJBlob(objString, mtlString);

    return {
      modelObjBlob: objBlob,
      modelMtlBlob: mtlBlob,
    };
  } catch (error) {
    console.error('Failed to generate OBJ from cart item:', error);
    throw new Error('OBJ 파일 생성에 실패했습니다.');
  }
}
