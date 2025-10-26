import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Scene3D } from '../components/Scene3D';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { OrderModal } from '../components/OrderModal';
import { ColorPalette } from '../components/ColorPalette';
import { useDesignStore } from '../store/useDesignStore';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { generateOBJFromCartItem } from '../utils/objGenerator';
import { generateQRString } from '../utils/qrGenerator';
import { createOrder } from '../utils/api';
import { getPricingSettings, calculatePlatePrice } from '../utils/pricing';
import type { AddressFormData } from '../components/AddressForm';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export function Home() {
  const { user } = useUser();

  // GLB 파츠 데이터 저장 (주문 시 OBJ 생성용)
  const [gltfs, setGltfs] = useState<{
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  } | null>(null);

  const [qrGeometriesMap, setQrGeometriesMap] = useState<Map<string, {
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

    if (!gltfs) {
      alert('3D 모델이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsOrderModalOpen(true);
  };

  // 주문 제출
  const handleOrderSubmit = async (addressData: AddressFormData) => {
    if (!user || !gltfs) return;

    const email = user.primaryEmailAddress?.emailAddress || addressData.customerEmail;

    try {
      // 가격 설정 가져오기
      const pricingSettings = await getPricingSettings();

      // 각 plate를 순회하며 주문 생성
      for (let i = 0; i < plates.length; i++) {
        const plate = plates[i];
        const geometries = qrGeometriesMap.get(plate.id);

        if (!geometries) {
          console.warn(`Plate ${plate.id} geometries not ready, skipping...`);
          continue;
        }

        console.log(`[Order ${i + 1}/${plates.length}] Generating OBJ files...`);

        // 1. OBJ/MTL Blob 생성
        const objBlobs = await generateOBJFromCartItem(
          { id: plate.id, plateConfig: plate, geometries, addedAt: new Date() },
          gltfs,
          {
            backTransform,
            brigeTransform,
            frontTransform,
            pinTransform,
            globalRotation,
          }
        );

        // 2. QR 문자열 생성
        let qrString = '';
        if (plate.qrType === 'url') {
          qrString = generateQRString('url', plate.qrUrl);
        } else if (plate.qrType === 'wifi') {
          qrString = generateQRString('wifi', plate.qrWifiData);
        } else if (plate.qrType === 'email') {
          qrString = generateQRString('email', plate.qrEmailData);
        }

        // 3. Customization 데이터 추출 (가격 계산용 필드 포함)
        const customization = {
          plate_width: 100,
          plate_height: 100,
          plate_depth: 5,
          qr_size: plate.qrSize,
          qr_depth: plate.qrThickness,
          qr_y_offset: plate.qrHeightOffset,
          text: plate.text,           // 가격 계산용
          images: plate.images,       // 가격 계산용
        };

        // 4. 가격 계산
        const platePrice = calculatePlatePrice(plate, pricingSettings);

        // 5. 주문 API 호출
        console.log(`[Order ${i + 1}/${plates.length}] Submitting order (${platePrice}원)...`);
        await createOrder(
          1, // stand_id (GLB 기반은 고정값 1)
          'GLB Base Stand', // stand_name
          qrString, // qr_url
          customization, // customization
          email, // customer_email
          addressData.customerName, // customer_name
          addressData.customerPhone, // customer_phone
          addressData.postalCode, // customer_postal_code
          `${addressData.address} ${addressData.detailAddress}`, // customer_address
          addressData.deliveryMessage, // delivery_message
          platePrice, // price (동적 계산)
          objBlobs.modelObjBlob,
          objBlobs.modelMtlBlob
        );

        console.log(`[Order ${i + 1}/${plates.length}] Order created successfully!`);
      }

      // 6. 성공 시 모달 닫기
      setIsOrderModalOpen(false);
      alert(`${plates.length}개의 주문이 완료되었습니다!\n"내 주문" 메뉴에서 확인하실 수 있습니다.`);
    } catch (error) {
      console.error('Order submission error:', error);
      throw error; // OrderModal에서 에러 메시지 표시
    }
  };

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
          geometries: qrGeometriesMap.get(plate.id) || null,
          addedAt: new Date()
        }))}
        customerEmail={user?.primaryEmailAddress?.emailAddress || ''}
        onSubmit={handleOrderSubmit}
      />
    </div>
  );
}
