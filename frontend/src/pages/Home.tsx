import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Scene3D } from '../components/Scene3D';
import { ColorPalette } from '../components/ColorPalette';
import { EditPanel } from '../components/EditPanel';
import { AddPlateButton } from '../components/AddPlateButton';
import { CartPanel } from '../components/CartPanel';
import { OrderModal } from '../components/OrderModal';
import { useDesignStore } from '../store/useDesignStore';
import { useCartStore } from '../store/useCartStore';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { generateOBJFromCartItem } from '../utils/objGenerator';
import { generateQRString } from '../utils/qrGenerator';
import { createOrder } from '../utils/api';
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
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectedPlate = useDesignStore((state) => state.plates).find(p => p.id === selectedPlateId);

  // 장바구니 관련
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // OBJ Transform 설정
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // 선택된 plate의 geometries
  const selectedQrGeometries = selectedPlate ? qrGeometriesMap.get(selectedPlate.id) : null;

  // 장바구니에 담기
  const handleAddToCart = () => {
    if (!selectedPlate) {
      alert('디자인할 판을 선택해주세요.');
      return;
    }

    if (!selectedQrGeometries) {
      alert('QR 코드가 아직 생성되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    addToCart(selectedPlate, selectedQrGeometries);
    alert('장바구니에 추가되었습니다!');
  };

  // 주문하기 버튼 클릭 (CartPanel에서)
  const handleCheckout = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
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
      // 각 장바구니 아이템을 순회하며 주문 생성
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];

        console.log(`[Order ${i + 1}/${cartItems.length}] Generating OBJ files...`);

        // 1. OBJ/MTL Blob 생성
        const objBlobs = await generateOBJFromCartItem(
          item,
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
        if (item.plateConfig.qrType === 'url') {
          qrString = generateQRString('url', item.plateConfig.qrUrl);
        } else if (item.plateConfig.qrType === 'wifi') {
          qrString = generateQRString('wifi', item.plateConfig.qrWifiData);
        } else if (item.plateConfig.qrType === 'email') {
          qrString = generateQRString('email', item.plateConfig.qrEmailData);
        }

        // 3. Customization 데이터 추출
        const customization = {
          plate_width: 100,
          plate_height: 100,
          plate_depth: 5,
          qr_size: item.plateConfig.qrSize,
          qr_depth: item.plateConfig.qrThickness,
          qr_y_offset: item.plateConfig.qrHeightOffset,
        };

        // 4. 주문 API 호출
        console.log(`[Order ${i + 1}/${cartItems.length}] Submitting order...`);
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
          10000, // price (임시: 10,000원)
          objBlobs.modelObjBlob,
          objBlobs.modelMtlBlob
        );

        console.log(`[Order ${i + 1}/${cartItems.length}] Order created successfully!`);
      }

      // 5. 성공 시 장바구니 비우기 및 모달 닫기
      clearCart();
      setIsOrderModalOpen(false);
      alert(`${cartItems.length}개의 주문이 완료되었습니다!\n"내 주문" 메뉴에서 확인하실 수 있습니다.`);
    } catch (error) {
      console.error('Order submission error:', error);
      throw error; // OrderModal에서 에러 메시지 표시
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex' }}>
      {/* 메인 씬 */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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

        {/* 상단 색상 팔레트 */}
        <ColorPalette />

        {/* 우측 편집 패널 */}
        <EditPanel />

        {/* 좌측 상단 추가 버튼 */}
        <AddPlateButton />

        {/* 장바구니 담기 버튼 (EditPanel 아래) */}
        {selectedPlate && (
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              top: '80vh',
              left: 'calc(100% - 340px)',
              padding: '14px 24px',
              backgroundColor: '#FF6B6B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#FF5252')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FF6B6B')}
          >
            🛒 장바구니 담기
          </button>
        )}

        {/* 장바구니 패널 */}
        <CartPanel onCheckout={handleCheckout} />

        {/* 주문 모달 */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          cartItems={cartItems}
          customerEmail={user?.primaryEmailAddress?.emailAddress || ''}
          onSubmit={handleOrderSubmit}
        />
      </div>
    </div>
  );
}
