import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";
import type { VertexGroup } from "../utils/glbLoader";
import { useQRGeometry } from "../hooks/useQRGeometry";
import { useTextGeometries } from "../hooks/useTextGeometry";
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
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
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

  const textGeometriesArray = useTextGeometries({
    texts: config.texts || [],
    qrThickness: config.qrThickness,
  });

  const imageGeometriesArray = useImageGeometry({
    images: config.images || [],
    qrThickness: config.qrThickness,
  });

  // Click handler
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPlate(config.id);
  };

  // Geometry data ref for parent component
  const geometryDataRef = useRef<any>(null);

  // Calculate text positions and quaternions
  const textPositionsAndQuaternions = useMemo(() => {
    if (!textRegion || textGeometriesArray.length === 0) return [];

    return textGeometriesArray.map(({ id, geometry, config: textConfig }) => {
      const { position, quaternion } = calculateTextPosition({
        textRegion,
        textGeometry: geometry,
        textHeightOffset: textConfig.heightOffset,
        textHorizontalOffset: textConfig.horizontalOffset,
        productType: config.productType,
        cardWidth: config.cardWidth,
        cardHeight: config.cardHeight,
      });

      return { id, geometry, position, quaternion };
    });
  }, [textRegion, textGeometriesArray, config.productType, config.cardWidth, config.cardHeight]);

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
    textGeometriesArray,
    imageGeometriesArray,
    qrRegion,
    config.qrColor,
    config.texts,
    config.images,
    config.qrUrl,
  ]);

  // QR 영역이 없으면 렌더링 안 함
  if (!qrRegion || !baseGeometry) {
    return null;
  }

  if (!qrTransform) return null;

  const { quaternion: qrQuaternion, position: qrPosition } = qrTransform;

  // Geometry 데이터를 ref에 저장 (useEffect에서 사용)
  const imagesToExport = imagePositionsAndQuaternions.filter((item): item is { geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion } => item !== null);
  const textsToExport = textPositionsAndQuaternions.map(({ id, geometry, position, quaternion }) => ({ geometry, position, quaternion }));

  geometryDataRef.current = {
    qr: baseGeometry,
    texts: textsToExport,
    images: imagesToExport,
    qrPosition,
    qrQuaternion,
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

      {/* 3D 텍스트들 */}
      {textPositionsAndQuaternions.map((data) => (
        <mesh
          key={`text-${data.id}`}
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
      ))}

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
