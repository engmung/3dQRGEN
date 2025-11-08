import * as THREE from 'three';

/**
 * OBJ Export용 메시 데이터 인터페이스
 */
export interface CollectedMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  partName: string; // 'back', 'brige', 'front', 'pin', 'qr', 'text', 'image_*', 'card'
}
