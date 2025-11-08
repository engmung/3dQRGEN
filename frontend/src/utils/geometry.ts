import * as THREE from 'three';

// Geometry 복제 (장바구니용)
export interface GeometrySet {
  qr: THREE.BufferGeometry | null;
  text: THREE.BufferGeometry | null;
  images: Array<{
    geometry: THREE.BufferGeometry;
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
  }>;
  qrPosition: THREE.Vector3;
  qrQuaternion: THREE.Quaternion;
  textPosition: THREE.Vector3 | null;
  textQuaternion: THREE.Quaternion | null;
  qrColor: string;
  zScale: number;
}

export const cloneGeometries = (geometries: GeometrySet | null): GeometrySet | null => {
  if (!geometries) return null;

  return {
    qr: geometries.qr?.clone() ?? null,
    text: geometries.text?.clone() ?? null,
    images: geometries.images.map(img => ({
      geometry: img.geometry.clone(),
      position: img.position.clone(),
      quaternion: img.quaternion.clone(),
    })),
    qrPosition: geometries.qrPosition.clone(),
    qrQuaternion: geometries.qrQuaternion.clone(),
    textPosition: geometries.textPosition?.clone() ?? null,
    textQuaternion: geometries.textQuaternion?.clone() ?? null,
    qrColor: geometries.qrColor,
    zScale: geometries.zScale,
  };
};

// Geometry 메모리 해제
export const disposeGeometry = (geometry: THREE.BufferGeometry | null): void => {
  if (geometry) {
    geometry.dispose();
  }
};

// GeometrySet 전체 해제
export const disposeGeometrySet = (geometries: GeometrySet | null): void => {
  if (!geometries) return;

  disposeGeometry(geometries.qr);
  disposeGeometry(geometries.text);
  geometries.images.forEach(img => disposeGeometry(img.geometry));
};
