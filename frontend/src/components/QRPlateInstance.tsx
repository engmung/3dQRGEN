import { useMemo, useState, useEffect } from "react";
import { generateQRBitmap } from "../utils/qrUtils";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";
import type { VertexGroup } from "../utils/glbLoader";

interface QRPlateInstanceProps {
  config: QRPlateConfig;
  isSelected: boolean;
  qrRegion: VertexGroup | null;
}

export const QRPlateInstance = ({
  config,
  isSelected,
  qrRegion,
}: QRPlateInstanceProps) => {
  const selectPlate = useDesignStore((state) => state.selectPlate);

  const [qrBitmap, setQrBitmap] = useState<{
    data: boolean[][];
    size: number;
  } | null>(null);
  const [hovered, setHovered] = useState(false);

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
    </group>
  );
};
