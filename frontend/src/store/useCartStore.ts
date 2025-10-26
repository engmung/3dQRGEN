import { create } from 'zustand';
import type { QRPlateConfig } from './useDesignStore';
import * as THREE from 'three';

// 장바구니 아이템 타입
export interface CartItem {
  id: string;  // 장바구니 아이템 고유 ID (UUID)
  plateConfig: QRPlateConfig;  // Plate 전체 설정
  quantity: number;  // 주문 수량
  geometries: {  // QR/텍스트/이미지 geometry 정보
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
  } | null;
  previewImage?: string;  // 미리보기 이미지 (Base64, optional)
  addedAt: Date;  // 추가된 시각
}

interface CartStore {
  items: CartItem[];

  // 장바구니에 아이템 추가
  addToCart: (plateConfig: QRPlateConfig, geometries: CartItem['geometries']) => void;

  // 장바구니에서 아이템 제거
  removeFromCart: (itemId: string) => void;

  // 장바구니 전체 비우기
  clearCart: () => void;

  // 장바구니 아이템 개수
  getCartItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (plateConfig, geometries) => {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      plateConfig: JSON.parse(JSON.stringify(plateConfig)), // Deep copy
      quantity: 1, // 기본 수량 1개
      geometries: geometries ? {
        qr: geometries.qr?.clone() ?? null,
        text: geometries.text?.clone() ?? null,
        image: geometries.image?.clone() ?? null,
        qrPosition: geometries.qrPosition.clone(),
        qrQuaternion: geometries.qrQuaternion.clone(),
        textPosition: geometries.textPosition?.clone() ?? null,
        textQuaternion: geometries.textQuaternion?.clone() ?? null,
        imagePosition: geometries.imagePosition?.clone() ?? null,
        imageQuaternion: geometries.imageQuaternion?.clone() ?? null,
        qrColor: geometries.qrColor,
        zScale: geometries.zScale,
      } : null,
      addedAt: new Date(),
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  removeFromCart: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getCartItemCount: () => {
    return get().items.length;
  },
}));
