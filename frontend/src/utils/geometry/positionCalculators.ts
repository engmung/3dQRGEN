import * as THREE from "three";
import { DIMENSIONS } from "../../constants/dimensions";
import type { VertexGroup } from "../glbLoader";

/**
 * 법선과 Up 벡터로부터 정확한 quaternion 계산
 */
export const getQuaternionFromNormalAndUp = (
  normal: THREE.Vector3,
  upVector: THREE.Vector3
): THREE.Quaternion => {
  // 회전 행렬 생성 (lookAt과 유사)
  const matrix = new THREE.Matrix4();

  // Z축 = 법선 방향 (forward)
  const zAxis = normal.clone().normalize();

  // X축 = up × forward (right)
  const xAxis = new THREE.Vector3().crossVectors(upVector, zAxis).normalize();

  // Y축 = forward × right (실제 up, 보정된)
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

  // 회전 행렬 설정
  matrix.makeBasis(xAxis, yAxis, zAxis);

  // 행렬을 quaternion으로 변환
  const quaternion = new THREE.Quaternion();
  quaternion.setFromRotationMatrix(matrix);

  return quaternion;
};

interface QRPositionParams {
  qrRegion: VertexGroup;
  qrSize: number;
  qrHeightOffset: number;
  qrHorizontalOffset: number;
  productType: 'stand' | 'card';
  cardWidth?: number;
  cardHeight?: number;
}

/**
 * QR 코드 위치와 회전 계산
 */
export const calculateQRPosition = ({
  qrRegion,
  qrSize,
  qrHeightOffset,
  qrHorizontalOffset,
  productType,
  cardWidth = DIMENSIONS.CARD.DEFAULT_WIDTH,
  cardHeight = DIMENSIONS.CARD.DEFAULT_HEIGHT,
}: QRPositionParams) => {
  // Quaternion 계산 (법선 + Up 벡터 사용)
  const quaternion = getQuaternionFromNormalAndUp(
    qrRegion.normal,
    qrRegion.upVector
  );

  // Right 벡터 계산 (upVector × normal)
  const rightVector = new THREE.Vector3()
    .crossVectors(qrRegion.upVector, qrRegion.normal)
    .normalize();

  // QR 크기를 고려한 높이/좌우 오프셋 제한
  const qrHalfSize = qrSize / 2;

  let clampedHeightOffset = qrHeightOffset;
  let clampedHorizontalOffset = qrHorizontalOffset;

  // 명함 모드: 명함 크기에 맞춰 제한
  if (productType === 'card') {
    // 높이 제한 (명함 세로 기준)
    const maxHeightOffset = (cardHeight - qrSize) / 2;
    const minHeightOffset = -(cardHeight - qrSize) / 2;
    clampedHeightOffset = Math.max(minHeightOffset, Math.min(maxHeightOffset, qrHeightOffset));

    // 좌우 제한 (명함 가로 기준)
    const maxHorizontalOffset = (cardWidth - qrSize) / 2;
    const minHorizontalOffset = -(cardWidth - qrSize) / 2;
    clampedHorizontalOffset = Math.max(minHorizontalOffset, Math.min(maxHorizontalOffset, qrHorizontalOffset));
  } else {
    // 거치대 모드: 기존 로직
    const PLATE_WIDTH = DIMENSIONS.STAND.PLATE_WIDTH;

    // 높이 제한 (상단, 하단 모두 제한)
    if (qrRegion.topBoundary !== null && qrRegion.bottomBoundary !== null) {
      const maxOffset = qrRegion.topBoundary - qrHalfSize; // 상단: QR 상단이 경계를 넘지 않도록
      const minOffset = qrRegion.bottomBoundary + qrHalfSize; // 하단: QR 하단이 경계를 넘지 않도록
      clampedHeightOffset = Math.max(minOffset, Math.min(maxOffset, qrHeightOffset));
    }

    // 좌우 제한 (판 너비 기준)
    const maxHorizontalOffset = (PLATE_WIDTH - qrSize) / 2;
    const minHorizontalOffset = -(PLATE_WIDTH - qrSize) / 2;
    clampedHorizontalOffset = Math.max(minHorizontalOffset, Math.min(maxHorizontalOffset, qrHorizontalOffset));
  }

  // QR 위치 계산
  // 1. 법선 방향으로 0.01mm만큼 offset (Z-fighting 방지하면서 표면에 거의 붙임)
  // 2. upVector 방향으로 clampedHeightOffset 만큼 offset (면을 따라 위아래 이동, 제한 적용)
  // 3. rightVector 방향으로 clampedHorizontalOffset 만큼 offset (면을 따라 좌우 이동, 제한 적용)
  const position = qrRegion.center.clone()
    .add(qrRegion.normal.clone().multiplyScalar(DIMENSIONS.GEOMETRY.NORMAL_OFFSET))
    .add(qrRegion.upVector.clone().multiplyScalar(clampedHeightOffset))
    .add(rightVector.multiplyScalar(clampedHorizontalOffset));

  return { quaternion, position, rightVector };
};

interface TextPositionParams {
  textRegion: VertexGroup;
  textGeometry: THREE.BufferGeometry;
  textHeightOffset: number;
  textHorizontalOffset: number;
  productType: 'stand' | 'card';
  cardWidth?: number;
  cardHeight?: number;
}

/**
 * 텍스트 위치와 회전 계산 (이미지와 동일한 방식)
 */
export const calculateTextPosition = ({
  textRegion,
  textGeometry,
  textHeightOffset,
  textHorizontalOffset,
  productType,
  cardWidth = DIMENSIONS.CARD.DEFAULT_WIDTH,
  cardHeight = DIMENSIONS.CARD.DEFAULT_HEIGHT,
}: TextPositionParams) => {
  // Quaternion 계산
  const quaternion = getQuaternionFromNormalAndUp(
    textRegion.normal,
    textRegion.upVector
  );

  // Right 벡터 계산
  const rightVector = new THREE.Vector3()
    .crossVectors(textRegion.upVector, textRegion.normal)
    .normalize();

  // 텍스트 오프셋 제한
  let clampedTextHeightOffset = textHeightOffset;
  let clampedTextHorizontalOffset = textHorizontalOffset;

  // 명함 모드: 명함 크기에 맞춰 제한 (텍스트 크기 고려)
  if (productType === 'card') {
    // 텍스트 bbox 계산 (대략적인 크기)
    textGeometry.computeBoundingBox();
    const textBbox = textGeometry.boundingBox!;
    const textWidth = textBbox.max.x - textBbox.min.x;
    const textHeight = textBbox.max.y - textBbox.min.y;

    // 높이 제한 (명함 세로 기준)
    const maxTextHeightOffset = (cardHeight - textHeight) / 2;
    const minTextHeightOffset = -(cardHeight - textHeight) / 2;
    clampedTextHeightOffset = Math.max(minTextHeightOffset, Math.min(maxTextHeightOffset, textHeightOffset));

    // 좌우 제한 (명함 가로 기준)
    const maxTextHorizontalOffset = (cardWidth - textWidth) / 2;
    const minTextHorizontalOffset = -(cardWidth - textWidth) / 2;
    clampedTextHorizontalOffset = Math.max(minTextHorizontalOffset, Math.min(maxTextHorizontalOffset, textHorizontalOffset));
  }

  // 텍스트 위치 계산 (이미지와 동일한 방식)
  const position = textRegion.center.clone()
    .add(textRegion.normal.clone().multiplyScalar(DIMENSIONS.GEOMETRY.NORMAL_OFFSET))
    .add(textRegion.upVector.clone().multiplyScalar(clampedTextHeightOffset))
    .add(rightVector.multiplyScalar(clampedTextHorizontalOffset));

  return { quaternion, position };
};

interface ImagePositionParams {
  imageRegion: VertexGroup;
  imageSize: number;
  imageHeightOffset: number;
  imageHorizontalOffset: number;
  productType: 'stand' | 'card';
  cardWidth?: number;
  cardHeight?: number;
}

/**
 * 이미지 위치와 회전 계산
 */
export const calculateImagePosition = ({
  imageRegion,
  imageSize,
  imageHeightOffset,
  imageHorizontalOffset,
  productType,
  cardWidth = DIMENSIONS.CARD.DEFAULT_WIDTH,
  cardHeight = DIMENSIONS.CARD.DEFAULT_HEIGHT,
}: ImagePositionParams) => {
  // Quaternion 계산
  const quaternion = getQuaternionFromNormalAndUp(
    imageRegion.normal,
    imageRegion.upVector
  );

  // Right 벡터 계산
  const imageRightVector = new THREE.Vector3()
    .crossVectors(imageRegion.upVector, imageRegion.normal)
    .normalize();

  // 이미지 오프셋 제한
  let clampedImageHeightOffset = imageHeightOffset;
  let clampedImageHorizontalOffset = imageHorizontalOffset;

  // 명함 모드: 명함 크기에 맞춰 제한
  if (productType === 'card') {
    // 높이 제한 (명함 세로 기준)
    const maxImageHeightOffset = (cardHeight - imageSize) / 2;
    const minImageHeightOffset = -(cardHeight - imageSize) / 2;
    clampedImageHeightOffset = Math.max(minImageHeightOffset, Math.min(maxImageHeightOffset, imageHeightOffset));

    // 좌우 제한 (명함 가로 기준)
    const maxImageHorizontalOffset = (cardWidth - imageSize) / 2;
    const minImageHorizontalOffset = -(cardWidth - imageSize) / 2;
    clampedImageHorizontalOffset = Math.max(minImageHorizontalOffset, Math.min(maxImageHorizontalOffset, imageHorizontalOffset));
  }

  // 이미지 위치 계산
  const position = imageRegion.center.clone()
    .add(imageRegion.normal.clone().multiplyScalar(DIMENSIONS.GEOMETRY.NORMAL_OFFSET))
    .add(imageRegion.upVector.clone().multiplyScalar(clampedImageHeightOffset))
    .add(imageRightVector.multiplyScalar(clampedImageHorizontalOffset));

  return { geometry: null, position, quaternion };
};
