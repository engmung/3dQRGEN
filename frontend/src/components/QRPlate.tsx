import { useMemo, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDesignStore } from '../store/useDesignStore';
import { generateQRBitmap } from '../utils/qrUtils';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { exportToSTL, exportToSTLBlob } from '../utils/stlExporter';
import { createOrder } from '../utils/api';

// mm to Three.js units (1mm = 1 unit)
const MM_TO_UNITS = 1;

export interface QRPlateRef {
  exportSTL: () => void;
  createOrderAndDownload: () => Promise<void>;
}

export const QRPlate = forwardRef<QRPlateRef>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const { user } = useUser();
  const standId = useDesignStore((state) => state.standId);
  const qrUrl = useDesignStore((state) => state.qrUrl);
  const plateWidth = useDesignStore((state) => state.plateWidth);
  const plateHeight = useDesignStore((state) => state.plateHeight);
  const plateDepth = useDesignStore((state) => state.plateDepth);
  const qrSize = useDesignStore((state) => state.qrSize);
  const qrDepth = useDesignStore((state) => state.qrDepth);
  const qrYOffset = useDesignStore((state) => state.qrYOffset);

  const [qrBitmap, setQrBitmap] = useState<{ data: boolean[][], size: number } | null>(null);

  useEffect(() => {
    if (!qrUrl) {
      setQrBitmap(null);
      return;
    }

    generateQRBitmap(qrUrl)
      .then(bitmap => setQrBitmap(bitmap))
      .catch(err => console.error('QR bitmap generation error:', err));
  }, [qrUrl]);

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

  // Export STL 및 주문 생성 함수를 부모 컴포넌트에 노출
  useImperativeHandle(ref, () => ({
    exportSTL: () => {
      if (groupRef.current) {
        const timestamp = new Date().getTime();
        const filename = `qr-plate-${timestamp}.stl`;
        exportToSTL(groupRef.current, filename);
      } else {
        console.error('Group ref is not available');
      }
    },
    createOrderAndDownload: async () => {
      if (!groupRef.current) {
        console.error('Group ref is not available');
        return;
      }

      try {
        // STL Blob 생성
        const stlBlob = exportToSTLBlob(groupRef.current);

        // Clerk에서 사용자 정보 추출
        const userEmail = user?.primaryEmailAddress?.emailAddress || 'unknown@example.com';
        const userName = user?.fullName || user?.firstName || '익명 사용자';

        // 주문 생성 (백엔드로 전송)
        const response = await createOrder(
          standId,
          qrUrl,
          {
            plate_width: plateWidth,
            plate_height: plateHeight,
            plate_depth: plateDepth,
            qr_size: qrSize,
            qr_depth: qrDepth,
            qr_y_offset: qrYOffset,
          },
          userEmail,
          userName,
          '',  // 주소는 나중에 별도로 입력받을 수 있음
          stlBlob
        );

        console.log('Order created:', response);

        // 주문 완료 알림
        alert(`주문이 완료되었습니다!\n주문 번호: ${response.order_uuid}`);
      } catch (error) {
        console.error('Failed to create order:', error);
        alert('주문 생성에 실패했습니다. 콘솔을 확인하세요.');
      }
    }
  }));

  // 거치대 크기 계산 (판 너비보다 5mm 더 큼 - standId 기반)
  const standWidth = plateWidth + (standId - 1) * 5;
  const standWidthUnits = standWidth * MM_TO_UNITS;
  const standDepth = 15; // 거치대 두께 (mm)
  const standDepthUnits = standDepth * MM_TO_UNITS;
  const standBackHeight = 50; // 거치대 뒷면 높이 (mm)
  const standBackHeightUnits = standBackHeight * MM_TO_UNITS;

  if (!qrUrl || !qrGeometry) {
    // URL 없거나 로딩 중일 때 기본 판만 표시
    return (
      <group ref={groupRef}>
        {/* 거치대 베이스 (바닥) */}
        <mesh position={[0, -plateHeightUnits / 2 - standDepthUnits / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[standWidthUnits, standDepthUnits, 3]} />
          <meshStandardMaterial color="#808080" />
        </mesh>

        {/* 거치대 백 (뒷면) */}
        <mesh position={[0, -plateHeightUnits / 2 + standBackHeightUnits / 2, -1.5]} castShadow receiveShadow>
          <boxGeometry args={[standWidthUnits, standBackHeightUnits, 3]} />
          <meshStandardMaterial color="#808080" />
        </mesh>

        {/* 베이스 판 (회전: X축 90도로 눕힘) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={false} receiveShadow>
          <boxGeometry args={[plateWidthUnits, plateDepthUnits, plateHeightUnits]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 거치대 베이스 (바닥) */}
      <mesh position={[0, -plateHeightUnits / 2 - standDepthUnits / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[standWidthUnits, standDepthUnits, 3]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* 거치대 백 (뒷면) */}
      <mesh position={[0, -plateHeightUnits / 2 + standBackHeightUnits / 2, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[standWidthUnits, standBackHeightUnits, 3]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* 베이스 판 (회전: X축 90도로 눕힘) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow={false} receiveShadow>
        <boxGeometry args={[plateWidthUnits, plateDepthUnits, plateHeightUnits]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* QR 블록들 - 판 상단에 배치 */}
      <group position={[0, qrYPosition, plateDepthUnits / 2]}>
        <mesh geometry={qrGeometry} castShadow receiveShadow={false}>
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>
    </group>
  );
});
