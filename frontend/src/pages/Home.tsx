import { useState } from 'react';
import { Scene3D } from '../components/Scene3D';
import { ColorPalette } from '../components/ColorPalette';
import { EditPanel } from '../components/EditPanel';
import { AddPlateButton } from '../components/AddPlateButton';
import { CartPanel } from '../components/CartPanel';
import { useDesignStore } from '../store/useDesignStore';
import { useCartStore } from '../store/useCartStore';
import * as THREE from 'three';

export function Home() {
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

  // Plates 가져오기
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const selectedPlate = useDesignStore((state) => state.plates).find(p => p.id === selectedPlateId);

  // 장바구니 관련
  const addToCart = useCartStore((state) => state.addToCart);

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

  // 주문하기 버튼 클릭
  const handleCheckout = () => {
    // TODO: OrderModal 열기
    alert('주문 기능은 곧 구현됩니다!');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex' }}>
      {/* 메인 씬 */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Scene3D
          onGltfsLoaded={() => {/* GLB 로드 완료 */}}
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
      </div>
    </div>
  );
}
