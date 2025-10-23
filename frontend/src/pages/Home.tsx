import { Scene3D } from '../components/Scene3D';
import type { Scene3DRef } from '../components/Scene3D';
import { SidePanel } from '../components/SidePanel';
import { AddressForm, type AddressFormData } from '../components/AddressForm';
import { useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDesignStore } from '../store/useDesignStore';
import { createOrder } from '../utils/api';

export function Home() {
  const scene3DRef = useRef<Scene3DRef>(null);
  const { user } = useUser();
  const qrUrl = useDesignStore((state) => state.qrUrl);
  const plateWidth = useDesignStore((state) => state.plateWidth);
  const plateHeight = useDesignStore((state) => state.plateHeight);
  const plateDepth = useDesignStore((state) => state.plateDepth);
  const qrSize = useDesignStore((state) => state.qrSize);
  const qrDepth = useDesignStore((state) => state.qrDepth);
  const qrYOffset = useDesignStore((state) => state.qrYOffset);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [plateObjBlobForOrder, setPlateObjBlobForOrder] = useState<Blob | null>(null);
  const [plateMtlBlobForOrder, setPlateMtlBlobForOrder] = useState<Blob | null>(null);
  const [standObjBlobForOrder, setStandObjBlobForOrder] = useState<Blob | null>(null);
  const [standMtlBlobForOrder, setStandMtlBlobForOrder] = useState<Blob | null>(null);
  const [orderPrice, setOrderPrice] = useState(0);

  const handleExportOBJ = () => {
    // OBJ+MTL Blob과 가격을 받아서 AddressForm 표시
    scene3DRef.current?.createOrderAndDownload((plateObjBlob, plateMtlBlob, standObjBlob, standMtlBlob, price) => {
      setPlateObjBlobForOrder(plateObjBlob);
      setPlateMtlBlobForOrder(plateMtlBlob);
      setStandObjBlobForOrder(standObjBlob);
      setStandMtlBlobForOrder(standMtlBlob);
      setOrderPrice(price);
      setShowAddressForm(true);
    });
  };

  const handleAddressSubmit = async (formData: AddressFormData) => {
    if (!plateObjBlobForOrder || !plateMtlBlobForOrder || !standObjBlobForOrder || !standMtlBlobForOrder) {
      alert('OBJ 파일 생성에 실패했습니다.');
      return;
    }

    const { standBaseDepth, standLedgeOffset } = useDesignStore.getState();

    try {
      // 주문 생성 (백엔드로 전송)
      const response = await createOrder(
        1, // standId - 더 이상 의미 없지만 백엔드 호환성 위해 1로 고정
        'L자 거치대', // standName
        qrUrl,
        {
          plate_width: plateWidth,
          plate_height: plateHeight,
          plate_depth: plateDepth,
          qr_size: qrSize,
          qr_depth: qrDepth,
          qr_y_offset: qrYOffset,
          stand_base_depth: standBaseDepth,
          stand_ledge_offset: standLedgeOffset,
        },
        formData.customerEmail,
        formData.customerName,
        formData.customerPhone,
        formData.postalCode,
        `${formData.address} ${formData.detailAddress}`,
        formData.deliveryMessage,
        orderPrice,
        plateObjBlobForOrder,
        plateMtlBlobForOrder,
        standObjBlobForOrder,
        standMtlBlobForOrder
      );

      console.log('Order created:', response);

      // 주문 완료 알림
      alert(
        `주문이 완료되었습니다!\n` +
        `주문번호: ${response.order_uuid}\n\n` +
        `💳 입금 계좌\n` +
        `국민은행 123-456-789012\n` +
        `예금주: 홍길동\n\n` +
        `⚠️ 입금 확인 후 제작에 들어갑니다.\n` +
        `주문 진행 상황은 '내 주문' 페이지에서 확인하실 수 있습니다.`
      );

      // 폼 닫기
      setShowAddressForm(false);
      setPlateObjBlobForOrder(null);
      setPlateMtlBlobForOrder(null);
      setStandObjBlobForOrder(null);
      setStandMtlBlobForOrder(null);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', margin: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, height: '100%' }}>
        <Scene3D ref={scene3DRef} />
      </div>
      <SidePanel onExportOBJ={handleExportOBJ} />

      {/* AddressForm 모달 - Canvas 밖에서 렌더링 */}
      {showAddressForm && (
        <AddressForm
          initialData={{
            customerName: user?.fullName || user?.firstName || '',
            customerEmail: user?.primaryEmailAddress?.emailAddress || '',
            customerPhone: '',
            postalCode: '',
            address: '',
            detailAddress: '',
            deliveryMessage: '',
          }}
          price={orderPrice}
          onSubmit={handleAddressSubmit}
          onCancel={() => {
            setShowAddressForm(false);
            setStlBlobForOrder(null);
          }}
        />
      )}
    </div>
  );
}
