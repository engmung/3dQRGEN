import { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDesignStore } from '../store/useDesignStore';
import { generateQRBitmap } from '../utils/qrUtils';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { RoundedBox } from '@react-three/drei';
import { exportToOBJ, exportToOBJBlob } from '../utils/objExporter';
import { calculatePrice } from '../utils/pricing';

// mm to Three.js units (1mm = 1 unit)
const MM_TO_UNITS = 1;

export interface QRPlateRef {
  exportOBJ: () => void;
  createOrderAndDownload: (onReady: (plateObjBlob: Blob, plateMtlBlob: Blob, standObjBlob: Blob, standMtlBlob: Blob, price: number) => void) => void;
}

export const QRPlate = forwardRef<QRPlateRef>((props, ref) => {
  const qrPlateGroupRef = useRef<THREE.Group>(null); // QR 판 + QR 블록만
  const standMeshRef = useRef<THREE.Mesh>(null); // 거치대만
  const qrUrl = useDesignStore((state) => state.qrUrl);
  const plateWidth = useDesignStore((state) => state.plateWidth);
  const plateHeight = useDesignStore((state) => state.plateHeight);
  const plateDepth = useDesignStore((state) => state.plateDepth);
  const qrSize = useDesignStore((state) => state.qrSize);
  const qrDepth = useDesignStore((state) => state.qrDepth);
  const qrYOffset = useDesignStore((state) => state.qrYOffset);
  const plateColor = useDesignStore((state) => state.plateColor);
  const qrColor = useDesignStore((state) => state.qrColor);
  const topArchRadius = useDesignStore((state) => state.topArchRadius);

  // 거치대 STL 관련
  const standAngle = useDesignStore((state) => state.standAngle);
  const standPositionX = useDesignStore((state) => state.standPositionX);
  const standPositionY = useDesignStore((state) => state.standPositionY);
  const standPositionZ = useDesignStore((state) => state.standPositionZ);
  const standRotationX = useDesignStore((state) => state.standRotationX);
  const standRotationY = useDesignStore((state) => state.standRotationY);
  const standRotationZ = useDesignStore((state) => state.standRotationZ);
  const standScale = useDesignStore((state) => state.standScale);

  // QR 판 디버그 위치/회전
  const qrPlatePositionX = useDesignStore((state) => state.qrPlatePositionX);
  const qrPlatePositionY = useDesignStore((state) => state.qrPlatePositionY);
  const qrPlatePositionZ = useDesignStore((state) => state.qrPlatePositionZ);
  const qrPlateRotationX = useDesignStore((state) => state.qrPlateRotationX);
  const qrPlateRotationY = useDesignStore((state) => state.qrPlateRotationY);
  const qrPlateRotationZ = useDesignStore((state) => state.qrPlateRotationZ);

  const [qrBitmap, setQrBitmap] = useState<{ data: boolean[][], size: number } | null>(null);
  const [standGeometry, setStandGeometry] = useState<THREE.BufferGeometry | null>(null);

  // 각도별 기본 회전값 (라디안)
  const getDefaultRotationForAngle = (angle: number): number => {
    const angleRotations: { [key: number]: number } = {
      90: 0,
      95: -5 * Math.PI / 180,
      100: -10 * Math.PI / 180,
      105: -15 * Math.PI / 180,
      110: -20 * Math.PI / 180,
    };
    return angleRotations[angle] || 0;
  };

  // 각도별 기본 위치값 (바닥면 기준)
  const getDefaultPositionForAngle = (angle: number): { y: number; z: number } => {
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
    if (!qrUrl) {
      setQrBitmap(null);
      return;
    }

    generateQRBitmap(qrUrl)
      .then(bitmap => setQrBitmap(bitmap))
      .catch(err => console.error('QR bitmap generation error:', err));
  }, [qrUrl]);

  // STL 파일 로드
  useEffect(() => {
    const loader = new STLLoader();
    const stlPath = `/stands/${standAngle}.stl`;

    loader.load(
      stlPath,
      (geometry) => {
        // Geometry를 중심으로 정렬 (bounding box 기준)
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;

        // 중심점 계산
        const centerX = (bbox.max.x + bbox.min.x) / 2;
        const centerY = (bbox.max.y + bbox.min.y) / 2;
        const centerZ = (bbox.max.z + bbox.min.z) / 2;

        // 원점으로 이동
        geometry.translate(-centerX, -centerY, -centerZ);

        console.log('STL Loaded:', {
          original: { min: bbox.min, max: bbox.max },
          center: { x: centerX, y: centerY, z: centerZ },
          size: {
            x: bbox.max.x - bbox.min.x,
            y: bbox.max.y - bbox.min.y,
            z: bbox.max.z - bbox.min.z
          }
        });

        setStandGeometry(geometry);
      },
      undefined,
      (error) => {
        console.error(`Failed to load STL: ${stlPath}`, error);
      }
    );
  }, [standAngle]);

  // QR 코드 3D 블록 생성
  const qrGeometry = useMemo(() => {
    if (!qrBitmap) return null;

    const { data, size } = qrBitmap;
    const qrSizeUnits = qrSize * MM_TO_UNITS;
    const blockSize = qrSizeUnits / size; // QR 크기를 픽셀 수로 나눔
    const blockDepth = qrDepth * MM_TO_UNITS; // mm -> units
    const geometries: THREE.BufferGeometry[] = [];

    // 각 검은 픽셀마다 작은 박스 생성
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y][x]) { // 검은 픽셀
          const boxGeo = new THREE.BoxGeometry(blockSize, blockSize, blockDepth);
          const boxMesh = new THREE.Mesh(boxGeo);

          // 중앙을 (0,0)으로 하는 좌표계
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

    // 모든 박스를 하나의 지오메트리로 병합
    return mergeGeometries(geometries);
  }, [qrBitmap, qrSize, qrDepth]);

  // 판과 QR 크기 계산 (mm -> units)
  const plateWidthUnits = plateWidth * MM_TO_UNITS;
  const plateHeightUnits = plateHeight * MM_TO_UNITS;
  const plateDepthUnits = plateDepth * MM_TO_UNITS;
  const qrSizeUnits = qrSize * MM_TO_UNITS;
  const qrYOffsetUnits = qrYOffset * MM_TO_UNITS;

  // QR을 판 상단에 배치 (Y축 양수 방향)
  const qrYPosition = plateHeightUnits / 2 - qrSizeUnits / 2 - qrYOffsetUnits;

  // Export OBJ 및 주문 생성 함수를 부모 컴포넌트에 노출
  useImperativeHandle(ref, () => ({
    exportOBJ: () => {
      if (qrPlateGroupRef.current && standMeshRef.current) {
        const timestamp = new Date().getTime();
        exportToOBJ(qrPlateGroupRef.current, `qr-plate-${timestamp}`);
        exportToOBJ(standMeshRef.current, `stand-${timestamp}`);
      } else {
        console.error('Refs are not available');
      }
    },
    createOrderAndDownload: (onReady: (plateObjBlob: Blob, plateMtlBlob: Blob, standObjBlob: Blob, standMtlBlob: Blob, price: number) => void) => {
      if (!qrPlateGroupRef.current || !standMeshRef.current) {
        console.error('Refs are not available');
        return;
      }

      // 가격 계산
      const orderPrice = calculatePrice({
        plateWidth,
        plateHeight,
        plateDepth,
        qrSize,
        qrDepth,
        standAngle,
      });

      // OBJ+MTL Blob 생성 (QR 판 + QR 블록, 거치대 따로)
      // QR 판: 현재 기울어진 각도를 역으로 계산하여 완전히 눕히기
      const qrPlateRotation = qrPlateRotationX + getDefaultRotationForAngle(standAngle);
      const flattenRotation = -qrPlateRotation - Math.PI / 2; // 기존 회전 제거 + 90도 눕히기

      const { objBlob: plateObjBlob, mtlBlob: plateMtlBlob } = exportToOBJBlob(qrPlateGroupRef.current, 'qr_plate', flattenRotation);
      // 거치대: 그대로 (프론트에 보이는 대로)
      const { objBlob: standObjBlob, mtlBlob: standMtlBlob } = exportToOBJBlob(standMeshRef.current, 'stand');

      // 콜백으로 4개의 blob과 price 전달
      onReady(plateObjBlob, plateMtlBlob, standObjBlob, standMtlBlob, orderPrice);
    }
  }));

  // 거치대 스케일 계산 (70mm 기준)
  const standWidthScale = plateWidthUnits / 70;

  // QR 블록 위치 계산 (바닥면 기준)
  const qrLocalY = plateHeightUnits - qrSizeUnits / 2 - qrYOffsetUnits;

  // 상단 모서리만 둥근 판 생성
  const plateGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = plateWidthUnits / 2;
    const h = plateHeightUnits;
    const r = topArchRadius; // 상단 모서리 반경

    // 바닥 왼쪽부터 시작 (시계 반대방향)
    shape.moveTo(-w, 0);

    // 왼쪽 변 (바닥 → 상단)
    shape.lineTo(-w, h - r);

    // 왼쪽 상단 모서리 (둥글게 또는 각지게)
    if (r > 0) {
      shape.quadraticCurveTo(-w, h, -w + r, h);
    } else {
      shape.lineTo(-w, h);
    }

    // 상단 변 (왼쪽 → 오른쪽)
    shape.lineTo(w - r, h);

    // 오른쪽 상단 모서리
    if (r > 0) {
      shape.quadraticCurveTo(w, h, w, h - r);
    } else {
      shape.lineTo(w, h);
    }

    // 오른쪽 변 (상단 → 바닥)
    shape.lineTo(w, 0);

    // 바닥 변 (오른쪽 → 왼쪽)
    shape.lineTo(-w, 0);

    const extrudeSettings = {
      depth: plateDepthUnits,
      bevelEnabled: false,
      curveSegments: 32, // 세그먼트 증가로 부드럽게
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // 중심 조정 (Z축 중심으로, Y축은 바닥 기준)
    geometry.translate(0, 0, -plateDepthUnits / 2);

    return geometry;
  }, [plateWidthUnits, plateHeightUnits, plateDepthUnits, topArchRadius]);

  if (!qrUrl || !qrGeometry) {
    // URL 없거나 로딩 중일 때 기본 판만 표시
    return (
      <group>
        {/* L자 거치대 (STL 파일) */}
        {standGeometry && (
          <mesh
            ref={standMeshRef}
            geometry={standGeometry}
            position={[standPositionX, standPositionY, standPositionZ]}
            rotation={[standRotationX + (-Math.PI / 2), standRotationY, standRotationZ + (Math.PI / 2)]}
            scale={[standScale, standWidthScale * standScale, standScale]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={plateColor} />
          </mesh>
        )}

        {/* QR 판 */}
        <group
          ref={qrPlateGroupRef}
          position={[
            qrPlatePositionX,
            qrPlatePositionY + getDefaultPositionForAngle(standAngle).y,
            qrPlatePositionZ + getDefaultPositionForAngle(standAngle).z
          ]}
          rotation={[qrPlateRotationX + getDefaultRotationForAngle(standAngle), qrPlateRotationY, qrPlateRotationZ]}
        >
          <mesh geometry={plateGeometry} position={[0, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={plateColor} />
          </mesh>
        </group>
      </group>
    );
  }

  return (
    <group>
      {/* L자 거치대 (STL 파일) */}
      {standGeometry && (
        <mesh
          ref={standMeshRef}
          geometry={standGeometry}
          position={[standPositionX, standPositionY, standPositionZ]}
          rotation={[standRotationX + (-Math.PI / 2), standRotationY, standRotationZ + (Math.PI / 2)]}
          scale={[standScale, standWidthScale * standScale, standScale]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={plateColor} />
        </mesh>
      )}

      {/* QR 판 + QR 블록 */}
      <group
        ref={qrPlateGroupRef}
        position={[
          qrPlatePositionX,
          qrPlatePositionY + getDefaultPositionForAngle(standAngle).y,
          qrPlatePositionZ + getDefaultPositionForAngle(standAngle).z
        ]}
        rotation={[qrPlateRotationX + getDefaultRotationForAngle(standAngle), qrPlateRotationY, qrPlateRotationZ]}
      >
        {/* QR 판 */}
        <mesh geometry={plateGeometry} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={plateColor} />
        </mesh>

        {/* QR 블록들 - 판 표면에 배치 */}
        <group position={[0, qrLocalY, plateDepthUnits / 2]}>
          <mesh geometry={qrGeometry} castShadow receiveShadow={false}>
            <meshStandardMaterial color={qrColor} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
