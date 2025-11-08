import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";
import type { VertexGroup } from "../utils/glbLoader";
import { useQRGeometry } from "../hooks/useQRGeometry";
import { useTextGeometry } from "../hooks/useTextGeometry";
import { useImageGeometry } from "../hooks/useImageGeometry";
import {
  calculateQRPosition,
  calculateTextPosition,
  calculateImagePosition
} from "../utils/geometry/positionCalculators";

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

  // Use custom hooks for geometry generation
  const { baseGeometry, baseThickness, zScale } = useQRGeometry({
    qrType: config.qrType,
    qrUrl: config.qrUrl,
    qrWifiData: config.qrWifiData,
    qrEmailData: config.qrEmailData,
    qrSize: config.qrSize,
    qrThickness: config.qrThickness,
  });

  const textGeometry = useTextGeometry({
    text: config.text,
    textFont: config.textFont,
    textSize: config.textSize,
    qrThickness: config.qrThickness,
  });

  const imageGeometriesArray = useImageGeometry({
    images: config.images,
    qrThickness: config.qrThickness,
  });

  // Click handler
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPlate(config.id);
  };

  // Geometry data ref for parent component
  const geometryDataRef = useRef<any>(null);

  // Calculate image positions and quaternions
  const imagePositionsAndQuaternions = useMemo(() => {
    if (!imageRegion || imageGeometriesArray.length === 0) return [];

    return config.images.map((img, index) => {
      const geometry = imageGeometriesArray[index];
      if (!geometry) return null;

      const { position, quaternion } = calculateImagePosition({
        imageRegion,
        imageSize: img.size,
        imageHeightOffset: img.heightOffset,
        imageHorizontalOffset: img.horizontalOffset,
        productType: config.productType,
        cardWidth: config.cardWidth,
        cardHeight: config.cardHeight,
      });

      return { geometry, position, quaternion };
    }).filter(Boolean);
  }, [imageRegion, imageGeometriesArray, config.images, config.productType, config.cardWidth, config.cardHeight]);

  // Calculate QR transform
  const qrTransform = useMemo(() => {
    if (!qrRegion) return null;

    return calculateQRPosition({
      qrRegion,
      qrSize: config.qrSize,
      qrHeightOffset: config.qrHeightOffset,
      qrHorizontalOffset: config.qrHorizontalOffset,
      productType: config.productType,
      cardWidth: config.cardWidth,
      cardHeight: config.cardHeight,
    });
  }, [qrRegion, config.qrSize, config.qrHeightOffset, config.qrHorizontalOffset, config.productType, config.cardWidth, config.cardHeight]);

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

  // Calculate text position and quaternion
  let textPosition: THREE.Vector3 | null = null;
  let textQuaternion: THREE.Quaternion | null = null;

  if (textRegion && textGeometry) {
    const textTransform = calculateTextPosition({
      textRegion,
      textGeometry,
      textHeightOffset: config.textHeightOffset,
      textHorizontalOffset: config.textHorizontalOffset,
      productType: config.productType,
      cardWidth: config.cardWidth,
      cardHeight: config.cardHeight,
    });
    textPosition = textTransform.position;
    textQuaternion = textTransform.quaternion;
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
