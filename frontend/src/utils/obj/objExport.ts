/**
 * OBJ/MTL Export 핵심 로직 (공통 모듈)
 * Blender 5.0 호환 형식
 * - OBJ 문자열 생성 (오브젝트별 그룹화, 노말 최적화)
 * - MTL 문자열 생성 (Blender 형식)
 * - Blob 생성
 */

import * as THREE from 'three';
import type { CollectedMesh } from '../../types/mesh';
import { mergeVertices } from '../geometry/mergeVertices';

/**
 * sRGB to Linear 변환 (Blender 호환)
 */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * 사용된 모든 색상을 수집
 */
function collectColors(meshes: CollectedMesh[]): Map<string, THREE.Color> {
  const colorMap = new Map<string, THREE.Color>();

  meshes.forEach(({ material }) => {
    const mat = Array.isArray(material) ? material[0] : material;
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
      const hexString = mat.color.getHexString();
      if (!colorMap.has(hexString)) {
        colorMap.set(hexString, mat.color.clone());
      }
    }
  });

  return colorMap;
}

/**
 * 머테리얼 이름으로 메시 그룹화
 */
function groupMeshesByMaterial(
  meshes: CollectedMesh[]
): Map<string, CollectedMesh[]> {
  const groups = new Map<string, CollectedMesh[]>();

  meshes.forEach((mesh) => {
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    let materialName = 'default';
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
      materialName = `color_${mat.color.getHexString()}`;
    }

    if (!groups.has(materialName)) {
      groups.set(materialName, []);
    }
    groups.get(materialName)!.push(mesh);
  });

  return groups;
}


/**
 * CollectedMesh 배열로부터 OBJ 문자열 생성 (Blender 형식)
 * @param meshes - 메시 배열
 * @param filename - 파일명 (MTL 참조용)
 * @param comment - OBJ 파일 상단 코멘트 (기본값: Blender 스타일)
 * @returns OBJ 문자열
 */
export function generateOBJString(
  meshes: CollectedMesh[],
  filename: string = 'model',
  comment: string = '# Blender 5.0.0\n# www.blender.org'
): string {
  let objString = `${comment}\n`;
  objString += `mtllib ${filename}.mtl\n`;

  // 파트 이름별로 그룹화
  const partGroups = new Map<string, CollectedMesh[]>();
  meshes.forEach((mesh) => {
    if (!partGroups.has(mesh.partName)) {
      partGroups.set(mesh.partName, []);
    }
    partGroups.get(mesh.partName)!.push(mesh);
  });

  let globalVertexOffset = 1;

  // 각 파트별로 처리 (오브젝트 단위)
  partGroups.forEach((partMeshes, partName) => {
    // 해당 파트의 모든 메시를 머테리얼별로 그룹화
    const materialGroups = groupMeshesByMaterial(partMeshes);

    // 오브젝트 시작
    objString += `o ${partName}\n`;

    // 해당 파트의 모든 버텍스 수집
    const allVertices: Array<{ x: number; y: number; z: number }> = [];

    // face 데이터: 버텍스 인덱스만 저장 (노말 없음)
    const faceData: Array<{
      materialName: string;
      faces: Array<number[]>;
    }> = [];

    materialGroups.forEach((matMeshes, materialName) => {
      const faces: Array<number[]> = [];

      matMeshes.forEach((mesh) => {
        // 중복 버텍스 병합
        const mergedGeo = mergeVertices(mesh.geometry, 0.0001);
        const positionAttr = mergedGeo.attributes.position;

        if (!positionAttr) return;

        const meshVertexStart = allVertices.length;

        // 버텍스 수집
        for (let i = 0; i < positionAttr.count; i++) {
          allVertices.push({
            x: positionAttr.getX(i),
            y: positionAttr.getY(i),
            z: positionAttr.getZ(i),
          });
        }

        // Face 수집
        const index = mergedGeo.index;
        if (index) {
          for (let i = 0; i < index.count; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);
            faces.push([
              meshVertexStart + a + 1, // 1-based
              meshVertexStart + b + 1,
              meshVertexStart + c + 1,
            ]);
          }
        } else {
          for (let i = 0; i < positionAttr.count; i += 3) {
            faces.push([
              meshVertexStart + i + 1,
              meshVertexStart + i + 1 + 1,
              meshVertexStart + i + 2 + 1,
            ]);
          }
        }
      });

      if (faces.length > 0) {
        faceData.push({ materialName, faces });
      }
    });

    // 버텍스 출력
    allVertices.forEach(({ x, y, z }) => {
      objString += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
    });

    // Face 출력 (머테리얼별) - 노말 없이 버텍스만
    faceData.forEach(({ materialName, faces }) => {
      objString += `usemtl ${materialName}\n`;
      faces.forEach((v) => {
        // 글로벌 오프셋 적용
        const f1 = v[0] + globalVertexOffset - 1;
        const f2 = v[1] + globalVertexOffset - 1;
        const f3 = v[2] + globalVertexOffset - 1;
        objString += `f ${f1} ${f2} ${f3}\n`;
      });
    });

    // 글로벌 오프셋 업데이트
    globalVertexOffset += allVertices.length;
  });

  return objString;
}

/**
 * MTL 문자열 생성 (Blender 형식)
 * @param meshes - 메시 배열 (색상 수집용)
 * @param filename - 파일명 (코멘트용)
 * @returns MTL 문자열
 */
export function generateMTLString(
  meshes: CollectedMesh[],
  filename: string = 'model'
): string {
  const colorMap = collectColors(meshes);

  let mtlString = `# Blender 5.0.0 MTL File: '${filename}'\n`;
  mtlString += `# www.blender.org\n\n`;

  // 각 색상마다 메테리얼 정의 (Blender 형식 - linear color space)
  colorMap.forEach((color, hexString) => {
    // sRGB to Linear 변환
    const r = srgbToLinear(color.r);
    const g = srgbToLinear(color.g);
    const b = srgbToLinear(color.b);

    mtlString += `newmtl color_${hexString}\n`;
    mtlString += `Ns 96.078453\n`;
    mtlString += `Ka 1.000000 1.000000 1.000000\n`;
    mtlString += `Kd ${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)}\n`;
    mtlString += `Ks 0.500000 0.500000 0.500000\n`;
    mtlString += `Ke 0.000000 0.000000 0.000000\n`;
    mtlString += `Ni 1.500000\n`;
    mtlString += `d 1.000000\n`;
    mtlString += `illum 2\n\n`;
  });

  // 기본 메테리얼 (혹시 모를 경우를 위해)
  if (colorMap.size === 0) {
    mtlString += `newmtl default\n`;
    mtlString += `Ns 96.078453\n`;
    mtlString += `Ka 1.000000 1.000000 1.000000\n`;
    mtlString += `Kd 0.800000 0.800000 0.800000\n`;
    mtlString += `Ks 0.500000 0.500000 0.500000\n`;
    mtlString += `Ke 0.000000 0.000000 0.000000\n`;
    mtlString += `Ni 1.500000\n`;
    mtlString += `d 1.000000\n`;
    mtlString += `illum 2\n`;
  }

  return mtlString;
}

/**
 * OBJ/MTL 문자열로부터 Blob 생성
 * @param objString - OBJ 문자열
 * @param mtlString - MTL 문자열
 * @returns OBJ/MTL Blob
 */
export function createOBJBlob(
  objString: string,
  mtlString: string
): { objBlob: Blob; mtlBlob: Blob } {
  const objBlob = new Blob([objString], { type: 'text/plain' });
  const mtlBlob = new Blob([mtlString], { type: 'text/plain' });
  return { objBlob, mtlBlob };
}

/**
 * OBJ/MTL 다운로드 (타임스탬프로 고유 파일명 생성)
 * @param objBlob - OBJ Blob
 * @param mtlBlob - MTL Blob
 * @param filename - 파일명 (확장자 제외)
 */
export async function downloadOBJBlobs(
  objBlob: Blob,
  mtlBlob: Blob,
  filename: string = 'model'
) {
  // 타임스탬프로 고유 파일명 생성 (중복 다운로드 시 파일명 불일치 방지)
  const timestamp = Date.now();
  const uniqueFilename = `${filename}_${timestamp}`;

  // OBJ 텍스트에서 mtllib 참조를 실제 파일명으로 수정
  let objText = await objBlob.text();
  objText = objText.replace(/mtllib .+\.mtl/, `mtllib ${uniqueFilename}.mtl`);

  // OBJ 다운로드
  const newObjBlob = new Blob([objText], { type: 'text/plain' });
  const objLink = document.createElement('a');
  objLink.href = URL.createObjectURL(newObjBlob);
  objLink.download = `${uniqueFilename}.obj`;
  objLink.click();
  URL.revokeObjectURL(objLink.href);

  // MTL 다운로드 (약간의 딜레이)
  await new Promise((resolve) => setTimeout(resolve, 100));
  const mtlLink = document.createElement('a');
  mtlLink.href = URL.createObjectURL(mtlBlob);
  mtlLink.download = `${uniqueFilename}.mtl`;
  mtlLink.click();
  URL.revokeObjectURL(mtlLink.href);
}
