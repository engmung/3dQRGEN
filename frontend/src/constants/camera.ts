/**
 * 3D QR 플랫폼 - 카메라 설정 상수
 * Three.js Scene3D에서 사용
 */

export const CAMERA = {
  // PC/데스크톱 카메라 설정
  PC: {
    position: {
      x: 220,
      y: 135,
      z: -117,
    },
    target: {
      x: 0,
      y: 50,
      z: 0,
    },
    fov: 50,
  },

  // 모바일 카메라 설정
  MOBILE: {
    position: {
      x: 340,
      y: 216,
      z: -147,
    },
    target: {
      x: 22.6,
      y: -3.5,
      z: -41.1,
    },
    fov: 50,
  },

  // OBJ Preview 카메라 설정
  OBJ_PREVIEW: {
    position: {
      x: 150,
      y: 100,
      z: 150,
    },
    fov: 50,
  },
} as const;

// 편의 함수: isMobile 상태에 따라 적절한 카메라 설정 반환
export const getCameraConfig = (isMobile: boolean) =>
  isMobile ? CAMERA.MOBILE : CAMERA.PC;

export type CameraConfig = typeof CAMERA;
