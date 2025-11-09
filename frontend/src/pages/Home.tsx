import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Scene3D } from '../components/Scene3D';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { OrderModal } from '../components/OrderModal';
import { ColorPalette } from '../components/color/ColorPalette';
import { MobileLayout } from '../components/MobileLayout';
import { useDesignStore } from '../store/useDesignStore';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { getPricingSettings } from '../utils/pricing';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useOrderSubmit } from '../hooks/useOrderSubmit';
import type { AddressFormData } from '../components/order/AddressForm';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface HomeProps {
  onLoadingComplete?: () => void;
}

export function Home({ onLoadingComplete }: HomeProps = {}) {
  const { user } = useUser();
  const isMobile = useIsMobile();

  // 전역 기본 색상 설정
  const setGlobalPlateColor = useDesignStore((state) => state.setGlobalPlateColor);
  const setGlobalQrColor = useDesignStore((state) => state.setGlobalQrColor);

  // 앱 시작 시 API에서 첫 번째 색상 조합을 가져와 전역 색상 설정
  useEffect(() => {
    const loadDefaultColors = async () => {
      try {
        const settings = await getPricingSettings();
        const combinations = JSON.parse(settings.allowed_combinations || '[]');
        if (combinations.length > 0 && combinations[0].colors?.length === 2) {
          setGlobalPlateColor(combinations[0].colors[0]);
          setGlobalQrColor(combinations[0].colors[1]);
        }
      } catch (error) {
        console.error('Failed to load default colors:', error);
      }
    };
    loadDefaultColors();
  }, [setGlobalPlateColor, setGlobalQrColor]);

  // GLB 파츠 데이터 저장 (주문 시 OBJ 생성용)
  const [gltfs, setGltfs] = useState<{
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  } | null>(null);

  const [qrGeometriesMap, setQrGeometriesMap] = useState<Map<string, {
    qr: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    qrColor: string;
    zScale: number;
  }>>(new Map());

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Plates 가져오기
  const plates = useDesignStore((state) => state.plates);

  // OBJ Transform 설정
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // 주문하기 버튼 클릭 (RightPanel에서)
  const handleCheckout = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (plates.length === 0) {
      alert('QR 판이 없습니다.');
      return;
    }

    // 거치대가 있는지 확인 (명함만 있으면 GLB 불필요)
    const hasStand = plates.some(plate => plate.productType === 'stand');
    if (hasStand && !gltfs) {
      alert('3D 모델이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsOrderModalOpen(true);
  };

  // 주문 제출 (커스텀 훅 사용)
  const { handleOrderSubmit: submitOrder } = useOrderSubmit({
    plates,
    gltfs,
    qrGeometriesMap,
    objTransforms: {
      backTransform,
      brigeTransform,
      frontTransform,
      pinTransform,
      globalRotation,
    },
  });

  const handleOrderSubmit = async (addressData: AddressFormData) => {
    try {
      await submitOrder(addressData);
      setIsOrderModalOpen(false);
    } catch (error) {
      // OrderModal에서 에러 메시지 표시
      throw error;
    }
  };

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <>
        <MobileLayout
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(plateId, geometries) => {
            setQrGeometriesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(plateId, geometries);
              return newMap;
            });
          }}
          onCheckout={handleCheckout}
          onLoadingComplete={onLoadingComplete}
        />

        {/* 주문 모달 */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          cartItems={plates.map(plate => ({
            id: plate.id,
            plateConfig: plate,
            quantity: plate.quantity,
            geometries: qrGeometriesMap.get(plate.id) || null,
            addedAt: new Date(),
          }))}
          customerEmail={user?.primaryEmailAddress?.emailAddress || ''}
          onSubmit={handleOrderSubmit}
        />
      </>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 50px)', // 헤더 높이 제외
      overflow: 'hidden'
    }}>
      {/* 좌측: 편집 패널 (40%) */}
      <LeftPanel />

      {/* 중앙: 3D 씬 (43%) */}
      <div style={{
        width: '43%',
        height: '100%',
        position: 'relative'
      }}>
        <Scene3D
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(plateId, geometries) => {
            setQrGeometriesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(plateId, geometries);
              return newMap;
            });
          }}
          onLoadingComplete={onLoadingComplete}
        />
        {/* 색상 팔레트 (3D 씬 영역 상단 중앙) */}
        <ColorPalette />
      </div>

      {/* 우측: QR 판 목록 + 주문 (17%) */}
      <RightPanel onCheckout={handleCheckout} />

      {/* 주문 모달 */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cartItems={plates.map(plate => ({
          id: plate.id,
          plateConfig: plate,
          quantity: plate.quantity,
          geometries: qrGeometriesMap.get(plate.id) || null,
          addedAt: new Date()
        }))}
        customerEmail={user?.primaryEmailAddress?.emailAddress || ''}
        onSubmit={handleOrderSubmit}
      />
    </div>
  );
}
