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
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
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
        texts: geometries.texts.map(txt => ({
          geometry: txt.geometry.clone(),
          position: txt.position.clone(),
          quaternion: txt.quaternion.clone()
        })),
        images: geometries.images.map(img => ({
          geometry: img.geometry.clone(),
          position: img.position.clone(),
          quaternion: img.quaternion.clone()
        })),
        qrPosition: geometries.qrPosition.clone(),
        qrQuaternion: geometries.qrQuaternion.clone(),
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
