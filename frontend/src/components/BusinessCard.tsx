/**
 * BusinessCard 컴포넌트
 * Three.js BoxGeometry로 명함을 생성하고,
 * QRPlateInstance가 QR/텍스트/이미지를 명함 위에 배치하도록 region 제공
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { QRPlateConfig } from '../store/useDesignStore';
import type { VertexGroup } from '../utils/glbLoader';
import { QRPlateInstance } from './QRPlateInstance';

interface BusinessCardProps {
  config: QRPlateConfig;
  isSelected: boolean;
  onGeometriesReady?: (geometries: {
    qr: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    qrColor: string;
    zScale: number;
  }) => void;
}

export function BusinessCard({ config, isSelected, onGeometriesReady }: BusinessCardProps) {
  // 명함 BoxGeometry
  const cardGeometry = useMemo(() => {
    return new THREE.BoxGeometry(config.cardWidth, config.cardHeight, config.cardThickness);
  }, [config.cardWidth, config.cardHeight, config.cardThickness]);

  // 명함 Material
  const cardMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ color: config.plateColor });
  }, [config.plateColor]);

  // QRPlateInstance에 전달할 가상 region 생성
  // 명함의 윗면 중앙을 기준으로 QR/텍스트/이미지 배치
  const cardRegions = useMemo((): {
    qrRegion: VertexGroup;
    textRegion: VertexGroup;
    imageRegion: VertexGroup;
  } => {
    // 명함을 나중에 X축으로 90도 회전할 것이므로,
    // region은 회전 전 좌표계(세워진 상태)로 정의

    // 명함 윗면 위치 (회전 전 - Z축 최상단)
    // 명함 중심이 (0,0,0)이고 BoxGeometry는 양쪽으로 커지므로
    // cardThickness/2만큼만 올려서 명함 윗면에 배치
    const centerPosition = new THREE.Vector3(0, 0, config.cardThickness / 2);

    // 명함 윗면 법선 (회전 전 - Z축 방향, 위쪽을 향하도록)
    const normal = new THREE.Vector3(0, 0, 1);

    // 명함의 위쪽 방향 (회전 전 - Y축 방향)
    const upVector = new THREE.Vector3(0, 1, 0);

    // 명함의 오른쪽 방향 (X축)
    const rightVector = new THREE.Vector3(1, 0, 0);

    // Bounding box (회전 전 좌표계)
    const bbox = new THREE.Box3(
      new THREE.Vector3(-config.cardWidth / 2, -config.cardHeight / 2, 0),
      new THREE.Vector3(config.cardWidth / 2, config.cardHeight / 2, config.cardThickness)
    );

    // QR, TEXT, IMAGE 모두 같은 region 사용 (명함 윗면)
    const commonRegion: VertexGroup = {
      vertices: [], // 실제 정점은 필요 없음
      center: centerPosition,
      bbox: bbox,
      normal: normal,
      upVector: upVector,
      size: new THREE.Vector3(config.cardWidth, config.cardHeight, config.cardThickness),
      count: 0,
      topBoundary: config.cardHeight / 2,
      bottomBoundary: -config.cardHeight / 2,
    };

    return {
      qrRegion: commonRegion,
      textRegion: commonRegion,
      imageRegion: commonRegion,
    };
  }, [config.cardWidth, config.cardHeight, config.cardThickness]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* 명함 3D 모델 (X축으로 -90도 회전 - 눕히기) */}
      <mesh geometry={cardGeometry} material={cardMaterial} castShadow>
        {/* 명함 중앙에 배치 */}
      </mesh>

      {/* QR/텍스트/이미지 인스턴스 (같은 group 안에서 함께 회전) */}
      <QRPlateInstance
        config={config}
        isSelected={isSelected}
        qrRegion={cardRegions.qrRegion}
        textRegion={cardRegions.textRegion}
        imageRegion={cardRegions.imageRegion}
        onGeometriesReady={onGeometriesReady}
      />
    </group>
  );
}
