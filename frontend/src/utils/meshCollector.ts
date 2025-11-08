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
 * @param gltf - GLB 파일 데이터
 * @param partName - 파츠 이름 ('back', 'brige', 'front', 'pin')
 * @param debugTransform - 디버깅용 transform
 * @param overrideColor - 색상 덮어쓰기 (OBJ export용, 옵션)
 * @param flipNormals - 법선(면) 뒤집기 (back 파트용, 기본값: false)
 */
export function collectGLBMeshes(
  gltf: GLTF,
  partName: string,
  debugTransform: Transform,
  overrideColor?: string,
  flipNormals: boolean = false
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

      // 3. 모델 뒤집기 (back 파트 전용 - X축 180도 회전)
      if (flipNormals) {
        const position = geo.attributes.position;
        for (let i = 0; i < position.count; i++) {
          // X축 기준 180도 회전: Y와 Z를 반전
          position.setY(i, -position.getY(i));
          position.setZ(i, -position.getZ(i));
        }
        position.needsUpdate = true;

        // 노말도 같이 회전
        const normals = geo.attributes.normal;
        if (normals) {
          for (let i = 0; i < normals.count; i++) {
            normals.setY(i, -normals.getY(i));
            normals.setZ(i, -normals.getZ(i));
          }
          normals.needsUpdate = true;
        }

        // 노말이 없으면 자동 생성 후 회전
        if (!normals) {
          geo.computeVertexNormals();
          const newNormals = geo.attributes.normal;
          for (let i = 0; i < newNormals.count; i++) {
            newNormals.setY(i, -newNormals.getY(i));
            newNormals.setZ(i, -newNormals.getZ(i));
          }
          newNormals.needsUpdate = true;
        }
      }

      // 4. Material 처리 (overrideColor가 있으면 새 material 생성)
      const material = overrideColor
        ? new THREE.MeshStandardMaterial({ color: overrideColor })
        : child.material;

      meshes.push({
        geometry: geo,
        material,
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
  imageGeometries: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>,
  qrPosition: THREE.Vector3,
  qrQuaternion: THREE.Quaternion,
  textPosition: THREE.Vector3 | null,
  textQuaternion: THREE.Quaternion | null,
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

    meshes.push({ geometry: geo, material, partName: 'qr' });
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

    meshes.push({ geometry: geo, material, partName: 'text' });
  }

  // Image Geometries (여러 개 지원)
  imageGeometries.forEach(({ geometry: imageGeometry, position: imagePosition, quaternion: imageQuaternion }, index) => {
    const geo = imageGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    const imageMatrix = new THREE.Matrix4().compose(
      imagePosition,
      imageQuaternion,
      new THREE.Vector3(1, 1, zScale) // Z축 스케일 적용 (두께)
    );
    geo.applyMatrix4(imageMatrix);

    // 디버깅 transform 적용
    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: `image_${index + 1}` });
  });

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
 * 명함 메시 수집 (BoxGeometry + QR/텍스트/이미지)
 * @param cardWidth - 명함 가로 (mm)
 * @param cardHeight - 명함 세로 (mm)
 * @param cardThickness - 명함 두께 (mm)
 * @param plateColor - 명함 색상
 * @param qrGeometry - QR Geometry
 * @param textGeometry - 텍스트 Geometry
 * @param imageGeometries - 이미지 Geometry 배열
 * @param qrPosition - QR 위치
 * @param qrQuaternion - QR 회전
 * @param textPosition - 텍스트 위치
 * @param textQuaternion - 텍스트 회전
 * @param qrColor - QR/텍스트/이미지 색상
 * @param zScale - QR 두께 스케일
 * @param debugTransform - 디버깅용 transform
 */
export function collectBusinessCardMeshes(
  cardWidth: number,
  cardHeight: number,
  cardThickness: number,
  plateColor: string,
  qrGeometry: THREE.BufferGeometry | null,
  textGeometry: THREE.BufferGeometry | null,
  imageGeometries: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>,
  qrPosition: THREE.Vector3,
  qrQuaternion: THREE.Quaternion,
  textPosition: THREE.Vector3 | null,
  textQuaternion: THREE.Quaternion | null,
  qrColor: string,
  zScale: number,
  debugTransform: Transform
): CollectedMesh[] {
  const meshes: CollectedMesh[] = [];

  // BusinessCard.tsx에서 group rotation={[-Math.PI / 2, 0, 0]}로 회전하므로
  // OBJ Export 시에도 동일한 회전 적용 필요
  const cardRotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

  // 1. 명함 BoxGeometry 생성
  const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
  const cardMaterial = new THREE.MeshStandardMaterial({ color: plateColor });

  // 명함 회전 적용
  cardGeometry.applyMatrix4(cardRotation);

  // 디버깅 transform 적용
  applyDebugTransform(cardGeometry, debugTransform);

  meshes.push({ geometry: cardGeometry, material: cardMaterial, partName: 'card' });

  // 2. QR Geometry
  // position/quaternion은 회전 전 좌표계의 값이므로,
  // position/quaternion 적용 후 명함 회전도 적용해야 함
  if (qrGeometry) {
    const geo = qrGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    // 1. position/quaternion 적용
    const qrMatrix = new THREE.Matrix4().compose(
      qrPosition,
      qrQuaternion,
      new THREE.Vector3(1, 1, zScale)
    );
    geo.applyMatrix4(qrMatrix);

    // 2. 명함 회전 적용 (group rotation과 동일)
    geo.applyMatrix4(cardRotation);

    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: 'qr' });
  }

  // 3. Text Geometry
  if (textGeometry && textPosition && textQuaternion) {
    const geo = textGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    // 1. position/quaternion 적용
    const textMatrix = new THREE.Matrix4().compose(
      textPosition,
      textQuaternion,
      new THREE.Vector3(1, 1, 1)
    );
    geo.applyMatrix4(textMatrix);

    // 2. 명함 회전 적용 (group rotation과 동일)
    geo.applyMatrix4(cardRotation);

    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: 'text' });
  }

  // 4. Image Geometries
  imageGeometries.forEach(({ geometry: imageGeometry, position: imagePosition, quaternion: imageQuaternion }, index) => {
    const geo = imageGeometry.clone();
    const material = new THREE.MeshStandardMaterial({ color: qrColor });

    // 1. position/quaternion 적용
    const imageMatrix = new THREE.Matrix4().compose(
      imagePosition,
      imageQuaternion,
      new THREE.Vector3(1, 1, 1)
    );
    geo.applyMatrix4(imageMatrix);

    // 2. 명함 회전 적용 (group rotation과 동일)
    geo.applyMatrix4(cardRotation);

    applyDebugTransform(geo, debugTransform);

    meshes.push({ geometry: geo, material, partName: `image_${index + 1}` });
  });

  return meshes;
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

  // Front 파트 또는 Card 파트의 Y 오프셋 계산 (QR/텍스트/이미지가 따라갈 기준)
  let baseOffsetY = 0;
  if (partGroups.has('front')) {
    // QR 간판 모드: Front 파트 기준
    const frontMeshes = partGroups.get('front')!;
    const box = new THREE.Box3();
    const tempGroup = new THREE.Group();
    frontMeshes.forEach(({ geometry }) => {
      const tempMesh = new THREE.Mesh(geometry);
      tempGroup.add(tempMesh);
    });
    box.setFromObject(tempGroup);
    baseOffsetY = -box.min.y;
  } else if (partGroups.has('card')) {
    // 명함 모드: Card 파트 기준
    const cardMeshes = partGroups.get('card')!;
    const box = new THREE.Box3();
    const tempGroup = new THREE.Group();
    cardMeshes.forEach(({ geometry }) => {
      const tempMesh = new THREE.Mesh(geometry);
      tempGroup.add(tempMesh);
    });
    box.setFromObject(tempGroup);
    baseOffsetY = -box.min.y;
  }

  // 각 파트별로 바운딩 박스 계산 및 접지
  partGroups.forEach((partMeshes, partName) => {
    // QR/텍스트/이미지는 기준 파트(Front 또는 Card)와 같은 Y 오프셋 사용 (개별 접지 안 함)
    if (partName === 'qr' || partName === 'text' || partName.startsWith('image_')) {
      partMeshes.forEach((mesh) => {
        const geo = mesh.geometry.clone();
        geo.translate(0, baseOffsetY, 0); // 기준 파트와 같은 오프셋
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
