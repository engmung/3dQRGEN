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
import { createOrderGroup, type LineItemData } from '../utils/api';
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
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
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

  // 주문 제출 (새 방식: OrderGroup)
  const handleOrderSubmit = async (addressData: AddressFormData) => {
    if (!user || !gltfs) return;

    const email = user.primaryEmailAddress?.emailAddress || addressData.customerEmail;

    try {
      // 가격 설정 가져오기
      const pricingSettings = await getPricingSettings();

      console.log(`[OrderGroup] Preparing ${plates.length} plates for submission...`);

      // 1. 모든 plate에 대해 OBJ 파일 생성 및 LineItem 데이터 준비
      const lineItemsData: LineItemData[] = [];
      const files: Blob[] = [];

      for (let i = 0; i < plates.length; i++) {
        const plate = plates[i];
        const geometries = qrGeometriesMap.get(plate.id);

        if (!geometries) {
          console.error(`Plate ${plate.id} geometries not ready!`);
          throw new Error(
            `일부 제품의 3D 모델이 준비되지 않았습니다.\n\n` +
            `💡 해결 방법:\n` +
            `우측 장바구니에서 모든 제품을 한 번씩 클릭하여 3D 모델을 확인한 후 다시 주문해주세요.\n\n` +
            `(새로고침 후 첫 주문 시 발생할 수 있는 현상입니다)`
          );
        }

        console.log(`[OrderGroup] Generating OBJ for plate ${i + 1}/${plates.length}...`);

        // OBJ/MTL Blob 생성
        const objBlobs = await generateOBJFromCartItem(
          { id: plate.id, plateConfig: plate, geometries, addedAt: new Date(), quantity: plate.quantity },
          gltfs,
          {
            backTransform,
            brigeTransform,
            frontTransform,
            pinTransform,
            globalRotation,
          }
        );

        // QR 문자열 생성
        let qrString = '';
        if (plate.qrType === 'url') {
          qrString = generateQRString('url', plate.qrUrl);
        } else if (plate.qrType === 'wifi') {
          qrString = generateQRString('wifi', plate.qrWifiData);
        } else if (plate.qrType === 'email') {
          qrString = generateQRString('email', plate.qrEmailData);
        }

        // Customization 데이터 (가격 계산 + 3D 정보)
        const customization = {
          plate_width: 100,
          plate_height: 100,
          plate_depth: 5,
          qr_size: plate.qrSize,
          qr_depth: plate.qrThickness,
          qr_y_offset: plate.qrHeightOffset,
          text: plate.text,
          images: plate.images,
          // 추가 정보도 저장 가능
          qrType: plate.qrType,
          plateColor: plate.plateColor,
          qrColor: plate.qrColor,
        };

        // 단가 계산
        const unitPrice = calculatePlatePrice(plate, pricingSettings);

        // LineItem 데이터 추가 (production_date는 서버가 자동 배분)
        lineItemsData.push({
          product_sku: 'QR-PLATE-BASE',
          qr_url: qrString,
          customization,
          quantity: plate.quantity,
          unit_price: unitPrice,  // 서버 검증용
        });

        // 파일 추가 (OBJ, MTL 순서)
        files.push(objBlobs.modelObjBlob);
        files.push(objBlobs.modelMtlBlob);
      }

      if (lineItemsData.length === 0) {
        throw new Error('생성 가능한 주문이 없습니다.');
      }

      // 2. OrderGroup API 호출 (한 번에 전체 제출)
      console.log(`[OrderGroup] Submitting order group with ${lineItemsData.length} line items...`);

      const response = await createOrderGroup(
        email,
        addressData.customerName,
        addressData.customerPhone,
        addressData.postalCode,
        `${addressData.address} ${addressData.detailAddress}`,
        addressData.deliveryMessage,
        lineItemsData,  // production_date가 각 LineItem에 포함됨
        files
      );

      console.log(`[OrderGroup] Success!`, response);

      // 3. 성공 시 모달 닫기
      setIsOrderModalOpen(false);

      const totalQuantity = lineItemsData.reduce((sum, item) => sum + item.quantity, 0);

      // 배분 결과 문자열 생성
      const allocationText = Object.entries(response.allocation || {})
        .map(([date, qty]) => `  - ${date}: ${qty}개`)
        .join('\n');

      alert(
        `주문이 완료되었습니다!\n` +
        `• 제품 종류: ${response.line_item_count}개\n` +
        `• 총 수량: ${totalQuantity}개\n` +
        `• 총 금액: ${response.total_price.toLocaleString()}원\n\n` +
        `📅 제작 일정:\n${allocationText}\n\n` +
        `※ 모든 제품 제작 완료 후 일괄 배송됩니다.\n` +
        `"내 주문" 메뉴에서 확인하실 수 있습니다.`
      );
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
