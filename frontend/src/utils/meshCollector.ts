import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Transform } from '../store/objPreviewStore';

export interface CollectedMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  partName: string; // 'back', 'brige', 'front', 'pin'
}

/**
 * GLB 파츠에서 모든 메시 수집 (world matrix 적용 + 디버깅 transform)
 */
export function collectGLBMeshes(
  gltf: GLTF,
  partName: string,
  debugTransform: Transform
): CollectedMesh[] {
  const meshes: CollectedMesh[] = [];

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geo = child.geometry.clone();

      // 1. World matrix 적용 (현재 씬의 위치/회전/스케일)
      child.updateMatrixWorld(true);
      geo.applyMatrix4(child.matrixWorld);

      // 2. 디버깅 transform 적용
      const debugMatrix = new THREE.Matrix4();

      // Position offset
      debugMatrix.makeTranslation(
        debugTransform.position[0],
        debugTransform.position[1],
        debugTransform.position[2]
      );

      // Rotation offset (degrees -> radians)
      const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(
          (debugTransform.rotation[0] * Math.PI) / 180,
          (debugTransform.rotation[1] * Math.PI) / 180,
          (debugTransform.rotation[2] * Math.PI) / 180,
          'XYZ'
        )
      );

      geo.applyMatrix4(rotMatrix);
      geo.applyMatrix4(debugMatrix);

      meshes.push({
        geometry: geo,
        material: child.material,
        partName,
      });
    }
  });

  return meshes;
}

/**
 * QR/텍스트/이미지 geometries 수집 (Front 파츠용)
 * QRPlateInstance에서 생성된 geometries를 받아서 처리
 */
export function collectQRGeometries(
  qrGeometry: THREE.BufferGeometry | null,
  textGeometry: THREE.BufferGeometry | null,
  imageGeometry: THREE.BufferGeometry | null,
  qrPosition: THREE.Vector3,
  qrQuaternion: THREE.Quaternion,
  textPosition: THREE.Vector3 | null,
  textQuaternion: THREE.Quaternion | null,
  imagePosition: THREE.Vector3 | null,
  imageQuaternion: THREE.Quaternion | null,
  qrColor: string,
  zScale: number,
  debugTransform: Transform
): CollectedMesh[] {
  const meshes: CollectedMesh[] = [];

  // QR Geometry
  if (qrGeometry) {
    const geo = qrGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    // QR의 world transform 적용
    const qrMatrix = new THREE.Matrix4().compose(
      qrPosition,
      qrQuaternion,
      new THREE.Vector3(1, 1, zScale) // Z축 스케일 적용 (두께)
    );
    geo.applyMatrix4(qrMatrix);

    // 디버깅 transform 적용
    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: 'qr' }); // partName을 'qr'로 변경
  }

  // Text Geometry
  if (textGeometry && textPosition && textQuaternion) {
    const geo = textGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    const textMatrix = new THREE.Matrix4().compose(
      textPosition,
      textQuaternion,
      new THREE.Vector3(1, 1, 1)
    );
    geo.applyMatrix4(textMatrix);

    // 디버깅 transform 적용
    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: 'text' }); // partName을 'text'로 변경
  }

  // Image Geometry
  if (imageGeometry && imagePosition && imageQuaternion) {
    const geo = imageGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    const imageMatrix = new THREE.Matrix4().compose(
      imagePosition,
      imageQuaternion,
      new THREE.Vector3(1, 1, 1)
    );
    geo.applyMatrix4(imageMatrix);

    // 디버깅 transform 적용
    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: 'image' }); // partName을 'image'로 변경
  }

  return meshes;
}

/**
 * 디버깅 transform 적용 헬퍼
 */
function applyDebugTransform(geometry: THREE.BufferGeometry, transform: Transform) {
  // Rotation
  const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(
      (transform.rotation[0] * Math.PI) / 180,
      (transform.rotation[1] * Math.PI) / 180,
      (transform.rotation[2] * Math.PI) / 180,
      'XYZ'
    )
  );
  geometry.applyMatrix4(rotMatrix);

  // Position
  const posMatrix = new THREE.Matrix4().makeTranslation(
    transform.position[0],
    transform.position[1],
    transform.position[2]
  );
  geometry.applyMatrix4(posMatrix);
}

/**
 * 전체 메시에 global rotation 적용 (눕히기)
 */
export function applyGlobalRotation(
  meshes: CollectedMesh[],
  globalRotation: [number, number, number]
): CollectedMesh[] {
  const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(
    new THREE.Euler(
      (globalRotation[0] * Math.PI) / 180,
      (globalRotation[1] * Math.PI) / 180,
      (globalRotation[2] * Math.PI) / 180,
      'XYZ'
    )
  );

  return meshes.map((mesh) => {
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(rotMatrix);
    return { ...mesh, geometry: geo };
  });
}

/**
 * 바운딩 박스로 바닥면 정렬
 * 각 파트별로 개별적으로 바닥에 접지
 */
export function alignToGround(meshes: CollectedMesh[]): CollectedMesh[] {
  if (meshes.length === 0) return meshes;

  // 파트별로 그룹화
  const partGroups = new Map<string, CollectedMesh[]>();
  meshes.forEach((mesh) => {
    if (!partGroups.has(mesh.partName)) {
      partGroups.set(mesh.partName, []);
    }
    partGroups.get(mesh.partName)!.push(mesh);
  });

  const result: CollectedMesh[] = [];

  // Front 파트의 Y 오프셋 계산 (QR/텍스트/이미지가 따라갈 기준)
  let frontOffsetY = 0;
  if (partGroups.has('front')) {
    const frontMeshes = partGroups.get('front')!;
    const box = new THREE.Box3();
    const tempGroup = new THREE.Group();
    frontMeshes.forEach(({ geometry }) => {
      const tempMesh = new THREE.Mesh(geometry);
      tempGroup.add(tempMesh);
    });
    box.setFromObject(tempGroup);
    frontOffsetY = -box.min.y;
  }

  // 각 파트별로 바운딩 박스 계산 및 접지
  partGroups.forEach((partMeshes, partName) => {
    // QR/텍스트/이미지는 Front 파트와 같은 Y 오프셋 사용 (개별 접지 안 함)
    if (partName === 'qr' || partName === 'text' || partName === 'image') {
      partMeshes.forEach((mesh) => {
        const geo = mesh.geometry.clone();
        geo.translate(0, frontOffsetY, 0); // Front와 같은 오프셋
        result.push({ ...mesh, geometry: geo });
      });
      return;
    }

    // 일반 파트는 개별 접지
    const box = new THREE.Box3();
    const tempGroup = new THREE.Group();

    partMeshes.forEach(({ geometry }) => {
      const tempMesh = new THREE.Mesh(geometry);
      tempGroup.add(tempMesh);
    });

    box.setFromObject(tempGroup);

    // 바운딩 박스 min.y를 0으로 만들기 위한 offset 계산
    const offsetY = -box.min.y;

    // 이 파트의 모든 메시에 Y 오프셋 적용
    partMeshes.forEach((mesh) => {
      const geo = mesh.geometry.clone();
      geo.translate(0, offsetY, 0);
      result.push({ ...mesh, geometry: geo });
    });
  });

  return result;
}
