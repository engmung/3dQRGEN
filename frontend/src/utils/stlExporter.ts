import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import * as THREE from 'three';

/**
 * THREE.js Object3D를 STL Blob으로 변환
 * @param object3D - Export할 3D 객체
 * @returns STL 파일 Blob
 */
export function exportToSTLBlob(object3D: THREE.Object3D): Blob {
  try {
    const exporter = new STLExporter();

    // 프린팅을 위해 모델 회전: 평평한 면이 아래로 가도록
    // 현재 판이 X축 90도 회전되어 있으므로, Z축 180도 추가 회전
    const exportGroup = new THREE.Group();
    const clonedObject = object3D.clone();

    // Z축 180도 회전하여 QR 블록이 위로, 평평한 면이 아래로
    clonedObject.rotation.z = Math.PI;

    exportGroup.add(clonedObject);
    exportGroup.updateMatrixWorld(true);

    // Binary STL로 export (파일 크기 작음)
    const result = exporter.parse(exportGroup, { binary: true });

    // ArrayBuffer를 Blob으로 변환
    return new Blob([result], { type: 'application/octet-stream' });
  } catch (error) {
    console.error('STL export failed:', error);
    throw error;
  }
}

/**
 * THREE.js Object3D를 STL 파일로 변환하여 다운로드
 * @param object3D - Export할 3D 객체
 * @param filename - 저장할 파일명
 */
export function exportToSTL(object3D: THREE.Object3D, filename: string = 'model.stl') {
  try {
    const blob = exportToSTLBlob(object3D);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // 메모리 정리
    URL.revokeObjectURL(link.href);

    console.log(`STL exported: ${filename}`);
  } catch (error) {
    console.error('STL export failed:', error);
    throw error;
  }
}
