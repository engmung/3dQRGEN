import { useState, useRef } from "react";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { Scene3D } from "./Scene3D";
import { ColorPalette } from "./ColorPalette";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface MobileLayoutProps {
  onGltfsLoaded: (gltfs: {
    back: GLTF;
    brige: GLTF;
    front: GLTF;
    pin: GLTF;
  }) => void;
  onQRGeometriesReady: (plateId: string, geometries: {
    qr: THREE.BufferGeometry | null;
    texts: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    images: Array<{ geometry: THREE.BufferGeometry; position: THREE.Vector3; quaternion: THREE.Quaternion }>;
    qrPosition: THREE.Vector3;
    qrQuaternion: THREE.Quaternion;
    qrColor: string;
    zScale: number;
  }) => void;
  onDownload: () => void;
  onLoadingComplete?: () => void;
}

type TabType = "edit" | "cart";
type PanelHeight = "closed" | "half" | "full";

const PANEL_HEIGHTS = {
  closed: 200,
  half: 40,    // 40% from top
  full: 100,   // Full screen
};

export function MobileLayout({
  onGltfsLoaded,
  onQRGeometriesReady,
  onDownload,
  onLoadingComplete,
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("edit");
  const [panelHeight, setPanelHeight] = useState<PanelHeight>("closed");
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const handleBarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate panel Y position
  const calculatePanelY = (): string => {
    if (isDragging) {
      // Real-time position during drag
      const baseHeight =
        panelHeight === "closed"
          ? window.innerHeight - PANEL_HEIGHTS.closed
          : panelHeight === "half"
          ? window.innerHeight * (PANEL_HEIGHTS.half / 100)
          : window.innerHeight * (1 - PANEL_HEIGHTS.full / 100);

      const newY = baseHeight + dragOffset;
      // Min/max limits
      const minY = window.innerHeight * 0.1; // Max 90%
      const maxY = window.innerHeight - PANEL_HEIGHTS.closed; // Min closed
      return `${Math.max(minY, Math.min(maxY, newY))}px`;
    }

    // Fixed height when not dragging
    if (panelHeight === "closed") {
      return `calc(100vh - ${PANEL_HEIGHTS.closed}px)`;
    } else if (panelHeight === "half") {
      return `${PANEL_HEIGHTS.half}%`;
    } else {
      return `${100 - PANEL_HEIGHTS.full}%`;
    }
  };

  // Apply vertical swipe only to handle bar
  useSwipeGesture(handleBarRef, {
    onSwipeUp: () => {
      if (panelHeight === "closed") {
        setPanelHeight("half");
      } else if (panelHeight === "half") {
        setPanelHeight("full");
      }
    },
    onSwipeDown: () => {
      if (panelHeight === "full") {
        setPanelHeight("half");
      } else if (panelHeight === "half") {
        setPanelHeight("closed");
      }
    },
    onDragMove: (deltaY) => {
      setIsDragging(true);
      setDragOffset(deltaY);
    },
    onDragEnd: () => {
      // Snap to closest height when drag ends
      const panel = handleBarRef.current?.parentElement;
      const currentY = panel?.getBoundingClientRect().top || 0;
      const viewportHeight = window.innerHeight;

      const closedY = viewportHeight - PANEL_HEIGHTS.closed;
      const halfY = viewportHeight * (PANEL_HEIGHTS.half / 100);
      const fullY = viewportHeight * (1 - PANEL_HEIGHTS.full / 100);

      const distances = [
        {
          height: "closed" as PanelHeight,
          distance: Math.abs(currentY - closedY),
        },
        { height: "half" as PanelHeight, distance: Math.abs(currentY - halfY) },
        { height: "full" as PanelHeight, distance: Math.abs(currentY - fullY) },
      ];

      const closest = distances.reduce((prev, curr) =>
        curr.distance < prev.distance ? curr : prev
      );

      setPanelHeight(closest.height);
      setIsDragging(false);
      setDragOffset(0);
    },
  });

  // Apply horizontal swipe only to content area
  useSwipeGesture(contentRef, {
    onSwipeLeft: () => {
      setActiveTab("cart");
    },
    onSwipeRight: () => {
      setActiveTab("edit");
    },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 50px)",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f5f3f0",
      }}
    >
      {/* 3D preview (full screen) */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Scene3D
          onGltfsLoaded={onGltfsLoaded}
          onQRGeometriesReady={onQRGeometriesReady}
          onLoadingComplete={onLoadingComplete}
        />
        <ColorPalette />
      </div>

      {/* Slide panel */}
      <div
        style={{
          position: "absolute",
          top: calculatePanelY(),
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
          transition: isDragging ? "none" : "top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 100,
        }}
      >
        {/* Handle bar */}
        <div
          ref={handleBarRef}
          style={{
            width: "100%",
            padding: "8px 0 10px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            borderBottom: "1px solid #e5e0db",
            flexShrink: 0,
            cursor: "grab",
          }}
        >
          {/* Drag handle */}
          <div
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "#ccc",
              borderRadius: "2px",
            }}
          />

          {/* Tab indicators */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setActiveTab("edit")}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                border:
                  activeTab === "edit"
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                backgroundColor:
                  activeTab === "edit" ? "#333" : "rgba(255, 255, 255, 0.5)",
                color: activeTab === "edit" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow:
                  activeTab === "edit"
                    ? "none"
                    : "0 0 4px rgba(255,255,255,0.9)",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                border:
                  activeTab === "cart"
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                backgroundColor:
                  activeTab === "cart" ? "#333" : "rgba(255, 255, 255, 0.5)",
                color: activeTab === "cart" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow:
                  activeTab === "cart"
                    ? "none"
                    : "0 0 4px rgba(255,255,255,0.9)",
              }}
            >
              Cart
            </button>
          </div>
        </div>

        {/* Content area (scrollable) */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateX(${activeTab === "edit" ? "0%" : "-50%"})`,
              transition: "transform 0.3s ease-out",
              width: "200%",
              height: "100%",
              display: "flex",
            }}
          >
            {/* Edit panel */}
            <div
              style={{
                width: "50%",
                height: "100%",
                overflow: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div style={{ padding: "16px 20px" }}>
                <LeftPanel />
              </div>
            </div>

            {/* Cart panel */}
            <div
              style={{
                width: "50%",
                height: "100%",
                overflow: "auto",
                WebkitOverflowScrolling: "touch",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              }}
            >
              <RightPanel onDownload={onDownload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
