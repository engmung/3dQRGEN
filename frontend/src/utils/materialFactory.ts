/**
 * Three.js material factory
 * Consolidates duplicate material creation patterns
 */
import * as THREE from 'three';

/**
 * Creates a standard material with default metalness/roughness
 * @param color - Material color (string or number)
 * @param options - Additional material parameters
 * @returns MeshStandardMaterial
 */
export function createStandardMaterial(
  color: string | number,
  options?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.7,
    ...options,
  });
}

/**
 * Applies material and shadow settings to all meshes in an object
 * @param object - THREE.Object3D to process
 * @param color - Material color
 * @param options - Shadow and material options
 */
export function applyMaterialToObject(
  object: THREE.Object3D,
  color: string | number,
  options?: {
    castShadow?: boolean;
    receiveShadow?: boolean;
    materialOptions?: Partial<THREE.MeshStandardMaterialParameters>;
  }
): void {
  const { castShadow = true, receiveShadow = true, materialOptions = {} } = options || {};

  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = createStandardMaterial(color, materialOptions);
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });
}

/**
 * Disposes all geometries and materials in an object
 * Useful for cleanup on unmount
 * @param object - THREE.Object3D to clean up
 */
export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose());
      } else {
        (child.material as THREE.Material)?.dispose();
      }
    }
  });
}
