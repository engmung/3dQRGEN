import { useMemo, useState, useEffect, useRef } from "react";
import { generateQRBitmap } from "../utils/qrUtils";
import { imageToContours, type ImageContours } from "../utils/imageUtils";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";
import type { VertexGroup } from "../utils/glbLoader";
import { loadFont, type FontKey } from "../utils/fontLoader";

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
  const [hovered, setHovered] = useState(false);
  const [textGeometry, setTextGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [imageContours, setImageContours] = useState<ImageContours | null>(null);

  // QR Bitmap 생성
  useEffect(() => {
    if (!config.qrUrl) {
      setQrBitmap(null);
      return;
    }

    generateQRBitmap(config.qrUrl)
      .then((bitmap) => setQrBitmap(bitmap))
      .catch((err) => console.error("QR bitmap generation error:", err));
  }, [config.qrUrl]);

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

  // 이미지 Contours 생성 (비동기, Marching Squares)
  useEffect(() => {
    if (!config.imageFile) {
      setImageContours(null);
      return;
    }

    let isCancelled = false;

    imageToContours(config.imageFile, 400) // 400x400 픽셀로 리샘플 (더 세밀한 윤곽선)
      .then((contours) => {
        if (isCancelled) return;
        setImageContours(contours);
      })
      .catch((err) => {
        console.error("Image contour extraction error:", err);
        setImageContours(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [config.imageFile]);


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

  // 이미지 3D geometry 생성 (부드러운 ExtrudeGeometry)
  const imageGeometry = useMemo(() => {
    if (!imageContours || imageContours.shapes.length === 0) return null;

    const { shapes, width, height } = imageContours;
    const imageSizeUnits = config.imageSize;

    // 스케일 계산 (픽셀 좌표 → mm 단위)
    const scaleX = imageSizeUnits / width;
    const scaleY = imageSizeUnits / height;

    // ExtrudeGeometry 설정
    const extrudeSettings = {
      depth: config.qrThickness, // QR 두께와 공유
      bevelEnabled: false,
      curveSegments: 12, // 부드러운 곡선
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
  }, [imageContours, config.imageSize, config.qrThickness]);

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

  useEffect(() => {
    if (onGeometriesReady && geometryDataRef.current) {
      onGeometriesReady(geometryDataRef.current);
    }
  }, [
    onGeometriesReady,
    baseGeometry,
    textGeometry,
    imageGeometry,
    qrRegion,
    config.qrColor,
    config.text,
    config.imageFile,
    config.qrUrl,
  ]);

  // QR 영역이 없으면 렌더링 안 함
  if (!qrRegion || !baseGeometry) {
    return null;
  }

  // Quaternion 계산 (법선 + Up 벡터 사용)
  const qrQuaternion = getQuaternionFromNormalAndUp(
    qrRegion.normal,
    qrRegion.upVector
  );

  // Right 벡터 계산 (upVector × normal)
  const rightVector = new THREE.Vector3()
    .crossVectors(qrRegion.upVector, qrRegion.normal)
    .normalize();

  // QR 크기를 고려한 높이/좌우 오프셋 제한
  const qrHalfSize = config.qrSize / 2;
  const PLATE_WIDTH = 60; // mm (판 너비)

  let clampedHeightOffset = config.qrHeightOffset;
  let clampedHorizontalOffset = config.qrHorizontalOffset;

  // 높이 제한 (상단, 하단 모두 제한)
  if (qrRegion.topBoundary !== null && qrRegion.bottomBoundary !== null) {
    const maxOffset = qrRegion.topBoundary - qrHalfSize; // 상단: QR 상단이 경계를 넘지 않도록
    const minOffset = qrRegion.bottomBoundary + qrHalfSize; // 하단: QR 하단이 경계를 넘지 않도록
    clampedHeightOffset = Math.max(minOffset, Math.min(maxOffset, config.qrHeightOffset));
  }

  // 좌우 제한 (판 너비 기준)
  const maxHorizontalOffset = (PLATE_WIDTH - config.qrSize) / 2;
  const minHorizontalOffset = -(PLATE_WIDTH - config.qrSize) / 2;
  clampedHorizontalOffset = Math.max(
    minHorizontalOffset,
    Math.min(maxHorizontalOffset, config.qrHorizontalOffset)
  );

  // QR 위치 계산
  // 1. 법선 방향으로 0만큼 offset (표면에 정확히 붙이기)
  // 2. upVector 방향으로 clampedHeightOffset 만큼 offset (면을 따라 위아래 이동, 제한 적용)
  // 3. rightVector 방향으로 clampedHorizontalOffset 만큼 offset (면을 따라 좌우 이동, 제한 적용)
  const qrPosition = qrRegion.center.clone()
    .add(qrRegion.upVector.clone().multiplyScalar(clampedHeightOffset))
    .add(rightVector.multiplyScalar(clampedHorizontalOffset));

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

    // 텍스트 위치 계산 (제한 없음)
    textPosition = textRegion.center.clone()
      .add(textRegion.upVector.clone().multiplyScalar(config.textHeightOffset))
      .add(textRightVector.multiplyScalar(config.textHorizontalOffset));
  }

  // 이미지 위치/회전 계산 (imageRegion이 있을 때만)
  let imagePosition: THREE.Vector3 | null = null;
  let imageQuaternion: THREE.Quaternion | null = null;

  if (imageRegion && imageGeometry) {
    // Quaternion 계산
    imageQuaternion = getQuaternionFromNormalAndUp(
      imageRegion.normal,
      imageRegion.upVector
    );

    // Right 벡터 계산
    const imageRightVector = new THREE.Vector3()
      .crossVectors(imageRegion.upVector, imageRegion.normal)
      .normalize();

    // 이미지 위치 계산 (제한 없음)
    imagePosition = imageRegion.center.clone()
      .add(imageRegion.upVector.clone().multiplyScalar(config.imageHeightOffset))
      .add(imageRightVector.multiplyScalar(config.imageHorizontalOffset));
  }

  // Geometry 데이터를 ref에 저장 (useEffect에서 사용)
  geometryDataRef.current = {
    qr: baseGeometry,
    text: textGeometry,
    image: imageGeometry,
    qrPosition,
    qrQuaternion,
    textPosition,
    textQuaternion,
    imagePosition,
    imageQuaternion,
    qrColor: config.qrColor,
    zScale,
  };

  return (
    <group position={[config.positionX, config.positionY, config.positionZ]}>
      {/* 선택 표시 원형 띠 (바닥) */}
      {isSelected && (
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <ringGeometry args={[80, 90, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>
      )}

      {/* QR 코드 3D 블록들 */}
      <mesh
        geometry={baseGeometry}
        position={qrPosition}
        quaternion={qrQuaternion}
        scale={[1, 1, zScale]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow={false}
      >
        <meshStandardMaterial
          color={config.qrColor}
          emissive={hovered ? "#666666" : "#000000"}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* 3D 텍스트 */}
      {textGeometry && textPosition && textQuaternion && (
        <mesh
          geometry={textGeometry}
          position={textPosition}
          quaternion={textQuaternion}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow={false}
        >
          <meshStandardMaterial
            color={config.qrColor}
            emissive={hovered ? "#666666" : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
      )}

      {/* 3D 이미지 */}
      {imageGeometry && imagePosition && imageQuaternion && (
        <mesh
          geometry={imageGeometry}
          position={imagePosition}
          quaternion={imageQuaternion}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow={false}
        >
          <meshStandardMaterial
            color={config.qrColor}
            emissive={hovered ? "#666666" : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>
      )}
    </group>
  );
};
