import { useState } from 'react';
import { Scene3D } from '../components/Scene3D';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { DownloadModal } from '../components/OrderModal';
import { ColorPalette } from '../components/color/ColorPalette';
import { MobileLayout } from '../components/MobileLayout';
import { useDesignStore } from '../store/useDesignStore';
import { useOBJPreviewStore } from '../store/objPreviewStore';
import { useIsMobile } from '../hooks/useMediaQuery';
import { generateOBJFromCartItem } from '../utils/objGenerator';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface HomeProps {
  onLoadingComplete?: () => void;
}

export function Home({ onLoadingComplete }: HomeProps = {}) {
  const isMobile = useIsMobile();

  // GLB parts data for OBJ generation
  const [gltfs, setGltfs] = useState<{
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  } | null>(null);

  const [qrGeometriesMap, setQrGeometriesMap] = useState<Map<string, {
    qr: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    qrColor: string;
    zScale: number;
  }>>(new Map());

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Get plates
  const plates = useDesignStore((state) => state.plates);

  // OBJ Transform settings
  const backTransform = useOBJPreviewStore((state) => state.backTransform);
  const brigeTransform = useOBJPreviewStore((state) => state.brigeTransform);
  const frontTransform = useOBJPreviewStore((state) => state.frontTransform);
  const pinTransform = useOBJPreviewStore((state) => state.pinTransform);
  const globalRotation = useOBJPreviewStore((state) => state.globalRotation);

  // Download button click
  const handleDownloadClick = () => {
    if (plates.length === 0) {
      alert('No QR plates to download.');
      return;
    }

    // Check if stand products need GLB
    const hasStand = plates.some(plate => plate.productType === 'stand');
    if (hasStand && !gltfs) {
      alert('3D models are still loading. Please wait and try again.');
      return;
    }

    setIsDownloadModalOpen(true);
  };

  // Handle download
  const handleDownload = async () => {
    const objTransforms = {
      backTransform,
      brigeTransform,
      frontTransform,
      pinTransform,
      globalRotation,
    };

    console.log(`[Download] Generating OBJ files for ${plates.length} plates...`);

    // Generate OBJ for each plate and download
    for (let i = 0; i < plates.length; i++) {
      const plate = plates[i];
      const geometries = qrGeometriesMap.get(plate.id);

      if (!geometries) {
        throw new Error(
          `3D model for plate ${i + 1} is not ready.\n\n` +
          `Please click on each plate in the cart to load the 3D model, then try again.`
        );
      }

      console.log(`[Download] Generating OBJ for plate ${i + 1}/${plates.length}...`);

      // Generate OBJ/MTL Blobs
      const objBlobs = await generateOBJFromCartItem(
        { id: plate.id, plateConfig: plate, geometries, addedAt: new Date(), quantity: plate.quantity },
        gltfs!,
        objTransforms
      );

      // Download OBJ file
      const objUrl = URL.createObjectURL(objBlobs.modelObjBlob);
      const objLink = document.createElement('a');
      objLink.href = objUrl;
      objLink.download = `qr_plate_${i + 1}.obj`;
      document.body.appendChild(objLink);
      objLink.click();
      document.body.removeChild(objLink);
      URL.revokeObjectURL(objUrl);

      // Download MTL file
      const mtlUrl = URL.createObjectURL(objBlobs.modelMtlBlob);
      const mtlLink = document.createElement('a');
      mtlLink.href = mtlUrl;
      mtlLink.download = `qr_plate_${i + 1}.mtl`;
      document.body.appendChild(mtlLink);
      mtlLink.click();
      document.body.removeChild(mtlLink);
      URL.revokeObjectURL(mtlUrl);

      // Small delay between downloads to avoid browser blocking
      if (i < plates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[Download] All ${plates.length} plates downloaded successfully!`);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <MobileLayout
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(plateId, geometries) => {
            setQrGeometriesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(plateId, geometries);
              return newMap;
            });
          }}
          onDownload={handleDownloadClick}
          onLoadingComplete={onLoadingComplete}
        />

        {/* Download modal */}
        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onDownload={handleDownload}
          itemCount={plates.length}
        />
      </>
    );
  }

  // Desktop layout
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 50px)',
      overflow: 'hidden'
    }}>
      {/* Left: Edit panel (40%) */}
      <LeftPanel />

      {/* Center: 3D scene (43%) */}
      <div style={{
        width: '43%',
        height: '100%',
        position: 'relative'
      }}>
        <Scene3D
          onGltfsLoaded={(loadedGltfs) => setGltfs(loadedGltfs)}
          onQRGeometriesReady={(plateId, geometries) => {
            setQrGeometriesMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(plateId, geometries);
              return newMap;
            });
          }}
          onLoadingComplete={onLoadingComplete}
        />
        {/* Color palette (top center of 3D scene) */}
        <ColorPalette />
      </div>

      {/* Right: QR plate list + download (17%) */}
      <RightPanel onDownload={handleDownloadClick} />

      {/* Download modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        itemCount={plates.length}
      />
    </div>
  );
}
