import { useMemo, useState, useEffect, useRef } from "react";
import { generateQRBitmap } from "../utils/qrUtils";
import { imageToContours, type ImageContours } from "../utils/imageUtils/index";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";
import type { VertexGroup } from "../utils/glbLoader";
import { loadFont, type FontKey } from "../utils/fontLoader";
import { generateQRString } from "../utils/qrGenerator";

interface QRPlateInstanceProps {
  config: QRPlateConfig;
  isSelected: boolean;
  qrRegion: VertexGroup | null;
  textRegion: VertexGroup | null;
  imageRegion: VertexGroup | null;
  onGeometriesReady?: (geometries: {
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
  }) => void;
}

export const QRPlateInstance = ({
  config,
  isSelected,
  qrRegion,
  textRegion,
  imageRegion,
  onGeometriesReady,
}: QRPlateInstanceProps) => {
  const selectPlate = useDesignStore((state) => state.selectPlate);

  const [qrBitmap, setQrBitmap] = useState<{
    data: boolean[][];
    size: number;
  } | null>(null);
  const [textGeometry, setTextGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [imageContoursArray, setImageContoursArray] = useState<(ImageContours | null)[]>([]);

  // QR Bitmap 생성 (타입에 따라 다른 문자열 생성)
  useEffect(() => {
    // QR 타입에 따라 문자열 생성
    let qrString = '';
    try {
      if (config.qrType === 'url') {
        qrString = generateQRString('url', config.qrUrl);
      } else if (config.qrType === 'wifi') {
        qrString = generateQRString('wifi', config.qrWifiData);
      } else if (config.qrType === 'email') {
        qrString = generateQRString('email', config.qrEmailData);
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
  }, [config.qrType, config.qrUrl, config.qrWifiData, config.qrEmailData]);

  // 텍스트 Geometry 생성 (비동기 폰트 로딩)
  useEffect(() => {
    if (!config.text || config.text.trim() === '') {
      setTextGeometry(null);
      return;
    }

    let isCancelled = false;

    loadFont(config.textFont as FontKey)
      .then((font) => {
        if (isCancelled) return;

        const geometry = new TextGeometry(config.text, {
          font: font,
          size: config.textSize,
          depth: config.qrThickness, // QR 두께와 공유!
          curveSegments: 12,
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
  }, [config.text, config.textFont, config.textSize, config.qrThickness]);

  // 이미지 Contours 생성 (비동기, Marching Squares) - 여러 이미지 지원
  useEffect(() => {
    if (config.images.length === 0) {
      setImageContoursArray([]);
      return;
    }

    let isCancelled = false;

    // 모든 이미지를 병렬로 처리
    Promise.all(
      config.images.map((img) =>
        imageToContours(img.file, 400).catch((err) => {
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
  }, [config.images]);


  // QR 코드 3D 블록 생성 (입체)
  // 기본 두께 1mm로 생성하고, 나중에 scale로 조절
  const { baseGeometry, baseThickness } = useMemo(() => {
    if (!qrBitmap) return { baseGeometry: null, baseThickness: 1 };

    const { data, size } = qrBitmap;
    const qrSizeUnits = config.qrSize;
    const blockSize = qrSizeUnits / size; // QR 크기를 픽셀 수로 나눔
    const baseThickness = 1; // 기본 두께 1mm
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
  }, [qrBitmap, config.qrSize]); // qrThickness 제거

  // Z축 스케일 계산 (두께 조절)
  const zScale = config.qrThickness / baseThickness;

  // 이미지 3D geometry 생성 (부드러운 ExtrudeGeometry) - 여러 이미지 지원
  const imageGeometriesArray = useMemo(() => {
    if (imageContoursArray.length === 0) return [];

    return imageContoursArray.map((imageContours, index) => {
      if (!imageContours || imageContours.shapes.length === 0) return null;

      const { shapes, width, height } = imageContours;
      const imageSizeUnits = config.images[index]?.size || 40;

      // 스케일 계산 (픽셀 좌표 → mm 단위)
      const scaleX = imageSizeUnits / width;
      const scaleY = imageSizeUnits / height;

      // ExtrudeGeometry 설정 (baseThickness 사용)
      const extrudeSettings = {
        depth: baseThickness, // 1mm (나중에 zScale로 조절)
        bevelEnabled: false,
        curveSegments: 12,
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
  }, [imageContoursArray, config.images, config.qrThickness]);

  // 법선과 Up 벡터로부터 정확한 quaternion 계산
  const getQuaternionFromNormalAndUp = (
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

  // 클릭 이벤트 핸들러
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPlate(config.id);
  };

  // Geometry 데이터를 부모로 전달
  // ⚠️ IMPORTANT: 반드시 early return 전에 배치 (Hook 순서 유지)
  // 하지만 위치/회전 계산은 early return 이후에 있으므로 ref 사용
  const geometryDataRef = useRef<any>(null);

  // 이미지 위치/회전 계산 (imageRegion이 있을 때만) - 여러 이미지 지원
  // ⚠️ IMPORTANT: early return 전에 배치 (Hook 순서 유지)
  const imagePositionsAndQuaternions = useMemo(() => {
    if (!imageRegion || imageGeometriesArray.length === 0) return [];

    return config.images.map((img, index) => {
      const geometry = imageGeometriesArray[index];
      if (!geometry) return null;

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
      let clampedImageHeightOffset = img.heightOffset;
      let clampedImageHorizontalOffset = img.horizontalOffset;

      // 명함 모드: 명함 크기에 맞춰 제한
      if (config.productType === 'card') {
        // 높이 제한 (명함 세로 기준)
        const maxImageHeightOffset = (config.cardHeight - img.size) / 2;
        const minImageHeightOffset = -(config.cardHeight - img.size) / 2;
        clampedImageHeightOffset = Math.max(minImageHeightOffset, Math.min(maxImageHeightOffset, img.heightOffset));

        // 좌우 제한 (명함 가로 기준)
        const maxImageHorizontalOffset = (config.cardWidth - img.size) / 2;
        const minImageHorizontalOffset = -(config.cardWidth - img.size) / 2;
        clampedImageHorizontalOffset = Math.max(minImageHorizontalOffset, Math.min(maxImageHorizontalOffset, img.horizontalOffset));
      }

      // 이미지 위치 계산
      const position = imageRegion.center.clone()
        .add(imageRegion.normal.clone().multiplyScalar(0.01))
        .add(imageRegion.upVector.clone().multiplyScalar(clampedImageHeightOffset))
        .add(imageRightVector.multiplyScalar(clampedImageHorizontalOffset));

      return { geometry, position, quaternion };
    }).filter(Boolean);
  }, [imageRegion, imageGeometriesArray, config.images, config.productType, config.cardWidth, config.cardHeight]);

  // QR transform 계산 (memoized for performance)
  // ⚠️ IMPORTANT: early return 전에 배치 (Hook 순서 유지)
  const qrTransform = useMemo(() => {
    if (!qrRegion) return null;

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
    const qrHalfSize = config.qrSize / 2;

    let clampedHeightOffset = config.qrHeightOffset;
    let clampedHorizontalOffset = config.qrHorizontalOffset;

    // 명함 모드: 명함 크기에 맞춰 제한
    if (config.productType === 'card') {
      // 높이 제한 (명함 세로 기준)
      const maxHeightOffset = (config.cardHeight - config.qrSize) / 2;
      const minHeightOffset = -(config.cardHeight - config.qrSize) / 2;
      clampedHeightOffset = Math.max(minHeightOffset, Math.min(maxHeightOffset, config.qrHeightOffset));

      // 좌우 제한 (명함 가로 기준)
      const maxHorizontalOffset = (config.cardWidth - config.qrSize) / 2;
      const minHorizontalOffset = -(config.cardWidth - config.qrSize) / 2;
      clampedHorizontalOffset = Math.max(minHorizontalOffset, Math.min(maxHorizontalOffset, config.qrHorizontalOffset));
    } else {
      // 거치대 모드: 기존 로직
      const PLATE_WIDTH = 60; // mm (판 너비)

      // 높이 제한 (상단, 하단 모두 제한)
      if (qrRegion.topBoundary !== null && qrRegion.bottomBoundary !== null) {
        const maxOffset = qrRegion.topBoundary - qrHalfSize; // 상단: QR 상단이 경계를 넘지 않도록
        const minOffset = qrRegion.bottomBoundary + qrHalfSize; // 하단: QR 하단이 경계를 넘지 않도록
        clampedHeightOffset = Math.max(minOffset, Math.min(maxOffset, config.qrHeightOffset));
      }

      // 좌우 제한 (판 너비 기준)
      const maxHorizontalOffset = (PLATE_WIDTH - config.qrSize) / 2;
      const minHorizontalOffset = -(PLATE_WIDTH - config.qrSize) / 2;
      clampedHorizontalOffset = Math.max(minHorizontalOffset, Math.min(maxHorizontalOffset, config.qrHorizontalOffset));
    }

    // QR 위치 계산
    // 1. 법선 방향으로 0.01mm만큼 offset (Z-fighting 방지하면서 표면에 거의 붙임)
    // 2. upVector 방향으로 clampedHeightOffset 만큼 offset (면을 따라 위아래 이동, 제한 적용)
    // 3. rightVector 방향으로 clampedHorizontalOffset 만큼 offset (면을 따라 좌우 이동, 제한 적용)
    const position = qrRegion.center.clone()
      .add(qrRegion.normal.clone().multiplyScalar(0.01))
      .add(qrRegion.upVector.clone().multiplyScalar(clampedHeightOffset))
      .add(rightVector.multiplyScalar(clampedHorizontalOffset));

    return { quaternion, position, rightVector };
  }, [qrRegion, config.qrSize, config.qrHeightOffset, config.qrHorizontalOffset, config.productType, config.cardWidth, config.cardHeight]);

  // Cleanup geometries on unmount
  // ⚠️ CRITICAL: Must be before ANY early return (Hook order must be consistent)
  useEffect(() => {
    return () => {
      baseGeometry?.dispose();
      textGeometry?.dispose();
      imageGeometriesArray?.forEach(geo => geo?.dispose());
    };
  }, [baseGeometry, textGeometry, imageGeometriesArray]);

  useEffect(() => {
    if (onGeometriesReady && geometryDataRef.current) {
      onGeometriesReady(geometryDataRef.current);
    }
  }, [
    onGeometriesReady,
    baseGeometry,
    textGeometry,
    imageGeometriesArray,
    qrRegion,
    config.qrColor,
    config.text,
    config.images,
    config.qrUrl,
  ]);

  // QR 영역이 없으면 렌더링 안 함
  if (!qrRegion || !baseGeometry) {
    return null;
  }

  if (!qrTransform) return null;

  const { quaternion: qrQuaternion, position: qrPosition } = qrTransform;

  // 텍스트 위치/회전 계산 (textRegion이 있을 때만)
  let textPosition: THREE.Vector3 | null = null;
  let textQuaternion: THREE.Quaternion | null = null;
  let textRightVector: THREE.Vector3 | null = null;

  if (textRegion && textGeometry) {
    // Quaternion 계산
    textQuaternion = getQuaternionFromNormalAndUp(
      textRegion.normal,
      textRegion.upVector
    );

    // Right 벡터 계산
    textRightVector = new THREE.Vector3()
      .crossVectors(textRegion.upVector, textRegion.normal)
      .normalize();

    // 텍스트 오프셋 제한
    let clampedTextHeightOffset = config.textHeightOffset;
    let clampedTextHorizontalOffset = config.textHorizontalOffset;

    // 명함 모드: 명함 크기에 맞춰 제한 (텍스트 크기 고려)
    if (config.productType === 'card') {
      // 텍스트 bbox 계산 (대략적인 크기)
      textGeometry.computeBoundingBox();
      const textBbox = textGeometry.boundingBox!;
      const textWidth = textBbox.max.x - textBbox.min.x;
      const textHeight = textBbox.max.y - textBbox.min.y;

      // 높이 제한 (명함 세로 기준)
      const maxTextHeightOffset = (config.cardHeight - textHeight) / 2;
      const minTextHeightOffset = -(config.cardHeight - textHeight) / 2;
      clampedTextHeightOffset = Math.max(minTextHeightOffset, Math.min(maxTextHeightOffset, config.textHeightOffset));

      // 좌우 제한 (명함 가로 기준)
      const maxTextHorizontalOffset = (config.cardWidth - textWidth) / 2;
      const minTextHorizontalOffset = -(config.cardWidth - textWidth) / 2;
      clampedTextHorizontalOffset = Math.max(minTextHorizontalOffset, Math.min(maxTextHorizontalOffset, config.textHorizontalOffset));
    }

    // 텍스트 위치 계산
    textPosition = textRegion.center.clone()
      .add(textRegion.normal.clone().multiplyScalar(0.01))
      .add(textRegion.upVector.clone().multiplyScalar(clampedTextHeightOffset))
      .add(textRightVector.multiplyScalar(clampedTextHorizontalOffset));
  }

  // Geometry 데이터를 ref에 저장 (useEffect에서 사용)
  const imagesToExport = imagePositionsAndQuaternions.filter((item): item is { geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion } => item !== null);

  geometryDataRef.current = {
    qr: baseGeometry,
    text: textGeometry,
    image: null, // Legacy field for backwards compatibility
    images: imagesToExport,
    qrPosition,
    qrQuaternion,
    textPosition,
    textQuaternion,
    imagePosition: null, // Legacy field for backwards compatibility
    imageQuaternion: null, // Legacy field for backwards compatibility
    qrColor: config.qrColor,
    zScale,
  };

  return (
    <group position={[0, 0, 0]}>
      {/* QR 코드 3D 블록들 */}
      <mesh
        geometry={baseGeometry}
        position={qrPosition}
        quaternion={qrQuaternion}
        scale={[1, 1, zScale]}
        onClick={handleClick}
        castShadow
        receiveShadow={false}
      >
        <meshStandardMaterial
          color={config.qrColor}
        />
      </mesh>

      {/* 3D 텍스트 */}
      {textGeometry && textPosition && textQuaternion && (
        <mesh
          geometry={textGeometry}
          position={textPosition}
          quaternion={textQuaternion}
          onClick={handleClick}
          castShadow
          receiveShadow={false}
        >
          <meshStandardMaterial
            color={config.qrColor}
          />
        </mesh>
      )}

      {/* 3D 이미지들 */}
      {imagePositionsAndQuaternions.map((data, index) => (
        data && (
          <mesh
            key={`image-${index}`}
            geometry={data.geometry}
            position={data.position}
            quaternion={data.quaternion}
            scale={[1, 1, zScale]}
            onClick={handleClick}
            castShadow
            receiveShadow={false}
          >
            <meshStandardMaterial
              color={config.qrColor}
            />
          </mesh>
        )
      ))}
    </group>
  );
};
