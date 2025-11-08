/**
 * 주문 제출 로직 커스텀 훅
 * Home.tsx에서 추출 (~160 lines)
 */

import { useUser } from '@clerk/clerk-react';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { AddressFormData } from '../components/order/AddressForm';
import type { QRPlateConfig } from '../store/useDesignStore';
import { generateOBJFromCartItem } from '../utils/objGenerator';
import { generateQRString } from '../utils/qrGenerator';
import { createOrderGroup, type LineItemData } from '../utils/api';
import { getPricingSettings, calculatePlatePrice } from '../utils/pricing';

interface UseOrderSubmitParams {
  plates: QRPlateConfig[];
  gltfs: {
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  } | null;
  qrGeometriesMap: Map<string, {
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
  }>;
  objTransforms: {
    backTransform: any;
    brigeTransform: any;
    frontTransform: any;
    pinTransform: any;
    globalRotation: any;
  };
}

export function useOrderSubmit(params: UseOrderSubmitParams) {
  const { user } = useUser();

  const handleOrderSubmit = async (addressData: AddressFormData) => {
    if (!user) return;

    const { plates, gltfs, qrGeometriesMap, objTransforms } = params;

    // 거치대가 있는지 확인 (명함만 있으면 GLB 불필요)
    const hasStand = plates.some(plate => plate.productType === 'stand');
    if (hasStand && !gltfs) {
      alert('거치대 3D 모델이 아직 로드되지 않았습니다.');
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress || addressData.customerEmail;

    try {
      // 가격 설정 가져오기
      const pricingSettings = await getPricingSettings();

      // 색상 조합 검증
      const allowedCombinations = JSON.parse(pricingSettings.allowed_combinations || '[]');
      const invalidPlates = plates.filter(plate => {
        return !allowedCombinations.some((combo: {colors: string[]}) =>
          combo.colors.includes(plate.plateColor) &&
          combo.colors.includes(plate.qrColor)
        );
      });

      if (invalidPlates.length > 0) {
        throw new Error(
          '일부 제품의 색상 조합이 출력 불가능합니다.\n\n' +
          '장바구니에서 허용된 색상 조합으로 변경해주세요.\n\n' +
          '허용된 조합은 색상 안내(?) 버튼에서 확인하실 수 있습니다.'
        );
      }

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
          gltfs!,
          objTransforms
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

        // Customization 데이터
        const customization = {
          plate_width: 100,
          plate_height: 100,
          plate_depth: 5,
          qr_size: plate.qrSize,
          qr_depth: plate.qrThickness,
          qr_y_offset: plate.qrHeightOffset,
          texts: plate.texts, // Multi-text array
          images: plate.images,
          qrType: plate.qrType,
          plateColor: plate.plateColor,
          qrColor: plate.qrColor,
        };

        // 단가 계산
        const unitPrice = calculatePlatePrice(plate, pricingSettings);

        // LineItem 데이터 추가
        lineItemsData.push({
          product_sku: 'QR-PLATE-BASE',
          qr_url: qrString,
          customization,
          quantity: plate.quantity,
          unit_price: unitPrice,
          product_type: plate.productType, // "stand" or "card"
        });

        // 파일 추가 (OBJ, MTL 순서)
        files.push(objBlobs.modelObjBlob);
        files.push(objBlobs.modelMtlBlob);
      }

      if (lineItemsData.length === 0) {
        throw new Error('생성 가능한 주문이 없습니다.');
      }

      // 2. OrderGroup API 호출
      console.log(`[OrderGroup] Submitting order group with ${lineItemsData.length} line items...`);

      const response = await createOrderGroup(
        email,
        addressData.customerName,
        addressData.customerPhone,
        addressData.postalCode,
        `${addressData.address} ${addressData.detailAddress}`,
        addressData.deliveryMessage,
        lineItemsData,
        files
      );

      console.log(`[OrderGroup] Success!`, response);

      // 3. 성공 메시지
      const totalQuantity = lineItemsData.reduce((sum, item) => sum + item.quantity, 0);
      const productTotal = lineItemsData.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const shippingFee = 5000;

      const allocationText = Object.entries(response.allocation || {})
        .map(([date, qty]) => `  - ${date}: ${qty}개`)
        .join('\n');

      alert(
        `주문이 완료되었습니다!\n` +
        `• 제품 종류: ${response.line_item_count}개\n` +
        `• 총 수량: ${totalQuantity}개\n` +
        `• 제품 합계: ${productTotal.toLocaleString()}원\n` +
        `• 배송비: ${shippingFee.toLocaleString()}원\n` +
        `• 총 금액: ${(productTotal + shippingFee).toLocaleString()}원\n\n` +
        `📅 제작 일정:\n${allocationText}\n\n` +
        `※ 모든 제품 제작 완료 후 일괄 배송됩니다.\n` +
        `"내 주문" 메뉴에서 확인하실 수 있습니다.`
      );

      return response;
    } catch (error) {
      console.error('Order submission error:', error);
      throw error;
    }
  };

  return { handleOrderSubmit };
}
