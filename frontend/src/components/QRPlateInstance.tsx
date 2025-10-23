import { useMemo, useState, useEffect } from "react";
import { generateQRBitmap } from "../utils/qrUtils";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useDesignStore, type QRPlateConfig } from "../store/useDesignStore";

// mm to Three.js units (1mm = 1 unit)
const MM_TO_UNITS = 1;

interface QRPlateInstanceProps {
  config: QRPlateConfig;
  isSelected: boolean;
}

export const QRPlateInstance = ({
  config,
  isSelected,
}: QRPlateInstanceProps) => {
  const selectPlate = useDesignStore((state) => state.selectPlate);

  const [qrBitmap, setQrBitmap] = useState<{
    data: boolean[][];
    size: number;
  } | null>(null);
  const [standGeometry, setStandGeometry] =
    useState<THREE.BufferGeometry | null>(null);
  const [hovered, setHovered] = useState(false);

  // 각도별 기본 회전값 (라디안)
  const getDefaultRotationForAngle = (angle: number): number => {
    const angleRotations: { [key: number]: number } = {
      90: 0,
      95: (-5 * Math.PI) / 180,
      100: (-10 * Math.PI) / 180,
      105: (-15 * Math.PI) / 180,
      110: (-20 * Math.PI) / 180,
    };
    return angleRotations[angle] || 0;
  };

  // 각도별 기본 위치값 (바닥면 기준)
  const getDefaultPositionForAngle = (
    angle: number
  ): { y: number; z: number } => {
    const anglePositions: { [key: number]: { y: number; z: number } } = {
      90: { y: -10, z: 26 },
      95: { y: -10, z: 26.2 },
      100: { y: -10, z: 26.2 },
      105: { y: -10, z: 25.9 },
      110: { y: -10, z: 25.5 },
    };
    return anglePositions[angle] || { y: -10, z: 26.2 };
  };

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

  // STL 파일 로드
  useEffect(() => {
    const loader = new STLLoader();
    const stlPath = `/stands/${config.standAngle}.stl`;

    loader.load(
      stlPath,
      (geometry) => {
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;

        const centerX = (bbox.max.x + bbox.min.x) / 2;
        const centerY = (bbox.max.y + bbox.min.y) / 2;
        const centerZ = (bbox.max.z + bbox.min.z) / 2;

        geometry.translate(-centerX, -centerY, -centerZ);

        setStandGeometry(geometry);
      },
      undefined,
      (error) => {
        console.error(`Failed to load STL: ${stlPath}`, error);
      }
    );
  }, [config.standAngle]);

  // QR 코드 3D 블록 생성
  const qrGeometry = useMemo(() => {
    if (!qrBitmap) return null;

    const { data, size } = qrBitmap;
    const qrSizeUnits = config.qrSize * MM_TO_UNITS;
    const blockSize = qrSizeUnits / size;
    const blockDepth = config.qrDepth * MM_TO_UNITS;
    const geometries: THREE.BufferGeometry[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y][x]) {
          const boxGeo = new THREE.BoxGeometry(
            blockSize,
            blockSize,
            blockDepth
          );
          const boxMesh = new THREE.Mesh(boxGeo);

          const posX = (x - size / 2) * blockSize + blockSize / 2;
          const posY = -(y - size / 2) * blockSize - blockSize / 2;

          boxMesh.position.set(posX, posY, blockDepth / 2);
          boxMesh.updateMatrix();

          const clonedGeo = boxGeo.clone();
          clonedGeo.applyMatrix4(boxMesh.matrix);
          geometries.push(clonedGeo);
        }
      }
    }

    if (geometries.length === 0) return null;

    return mergeGeometries(geometries);
  }, [qrBitmap, config.qrSize, config.qrDepth]);

  // 판과 QR 크기 계산 (mm -> units)
  const plateWidthUnits = config.plateWidth * MM_TO_UNITS;
  const plateHeightUnits = config.plateHeight * MM_TO_UNITS;
  const plateDepthUnits = config.plateDepth * MM_TO_UNITS;

  // 거치대 스케일 계산 (70mm 기준)
  const standWidthScale = plateWidthUnits / 70;

  // QR 블록 위치 계산 (바닥면 기준)
  const qrLocalY =
    plateHeightUnits -
    (config.qrSize * MM_TO_UNITS) / 2 -
    config.qrYOffset * MM_TO_UNITS;

  // 상단 모서리만 둥근 판 생성
  const plateGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = plateWidthUnits / 2;
    const h = plateHeightUnits;
    const r = config.topArchRadius;

    shape.moveTo(-w, 0);
    shape.lineTo(-w, h - r);

    if (r > 0) {
      shape.quadraticCurveTo(-w, h, -w + r, h);
    } else {
      shape.lineTo(-w, h);
    }

    shape.lineTo(w - r, h);

    if (r > 0) {
      shape.quadraticCurveTo(w, h, w, h - r);
    } else {
      shape.lineTo(w, h);
    }

    shape.lineTo(w, 0);
    shape.lineTo(-w, 0);

    const extrudeSettings = {
      depth: plateDepthUnits,
      bevelEnabled: false,
      curveSegments: 32,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -plateDepthUnits / 2);

    return geometry;
  }, [
    plateWidthUnits,
    plateHeightUnits,
    plateDepthUnits,
    config.topArchRadius,
  ]);

  // 클릭 이벤트 핸들러
  const handleClick = (e: any) => {
    e.stopPropagation();
    selectPlate(config.id);
  };

  const defaultPos = getDefaultPositionForAngle(config.standAngle);

  if (!config.qrUrl || !qrGeometry) {
    return (
      <group position={[config.positionX, config.positionY, config.positionZ]}>
        {/* 선택 표시 원형 띠 (바닥) */}
        {isSelected && (
          <mesh
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <ringGeometry
              args={[plateWidthUnits * 0.8, plateWidthUnits * 0.9, 64]}
            />
            <meshBasicMaterial color="#000000" transparent opacity={0.5} />
          </mesh>
        )}

        {/* 거치대 */}
        {standGeometry && (
          <mesh
            geometry={standGeometry}
            position={[0, 18, 0]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={[1, standWidthScale, 1]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={config.plateColor} />
          </mesh>
        )}

        {/* QR 판 */}
        <group
          position={[0, defaultPos.y + 18, defaultPos.z]}
          rotation={[getDefaultRotationForAngle(config.standAngle), 0, 0]}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <mesh geometry={plateGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={config.plateColor}
              emissive={hovered ? "#666666" : "#000000"}
              emissiveIntensity={hovered ? 0.2 : 0}
            />
          </mesh>
        </group>
      </group>
    );
  }

  return (
    <group position={[config.positionX, config.positionY, config.positionZ]}>
      {/* 선택 표시 원형 띠 (바닥) */}
      {isSelected && (
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <ringGeometry
            args={[plateWidthUnits * 0.8, plateWidthUnits * 0.9, 64]}
          />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>
      )}

      {/* 거치대 */}
      {standGeometry && (
        <mesh
          geometry={standGeometry}
          position={[0, 18, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={[1, standWidthScale, 1]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={config.plateColor} />
        </mesh>
      )}

      {/* QR 판 + QR 블록 */}
      <group
        position={[0, defaultPos.y + 18, defaultPos.z]}
        rotation={[getDefaultRotationForAngle(config.standAngle), 0, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* QR 판 */}
        <mesh geometry={plateGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.plateColor}
            emissive={hovered ? "#666666" : "#000000"}
            emissiveIntensity={hovered ? 0.2 : 0}
          />
        </mesh>

        {/* QR 블록들 - 판 표면에 배치 */}
        <group position={[0, qrLocalY, plateDepthUnits / 2]}>
          <mesh geometry={qrGeometry} castShadow receiveShadow={false}>
            <meshStandardMaterial color={config.qrColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
