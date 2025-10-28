import { useState, useRef } from "react";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { Scene3D } from "./Scene3D";
import { ColorPalette } from "./ColorPalette";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import type { GLTFResult } from "../types/gltf";

interface MobileLayoutProps {
  onGltfsLoaded: (gltfs: GLTFResult[]) => void;
  onQRGeometriesReady: (plateId: string, geometries: any[]) => void;
  onCheckout: () => void;
}

type TabType = "edit" | "cart";
type PanelHeight = "closed" | "half" | "full";

const PANEL_HEIGHTS = {
  closed: 200,
  half: 40,    // 하단에서 40% 올라온 위치
  full: 95,    // 하단에서 95% 올라온 위치 (거의 전체 화면)
};

export function MobileLayout({
  onGltfsLoaded,
  onQRGeometriesReady,
  onCheckout,
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("edit");
  const [panelHeight, setPanelHeight] = useState<PanelHeight>("closed");
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const handleBarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 패널 높이 계산
  const calculatePanelY = (): string => {
    if (isDragging) {
      // 드래그 중일 때는 실시간 위치
      const baseHeight =
        panelHeight === "closed"
          ? window.innerHeight - PANEL_HEIGHTS.closed
          : panelHeight === "half"
          ? window.innerHeight * (PANEL_HEIGHTS.half / 100)
          : window.innerHeight * (1 - PANEL_HEIGHTS.full / 100);

      const newY = baseHeight + dragOffset;
      // 최소/최대 제한
      const minY = window.innerHeight * 0.1; // 최대 90%
      const maxY = window.innerHeight - PANEL_HEIGHTS.closed; // 최소 닫힘
      return `${Math.max(minY, Math.min(maxY, newY))}px`;
    }

    // 드래그 안할 때는 정해진 높이
    if (panelHeight === "closed") {
      return `calc(100vh - ${PANEL_HEIGHTS.closed}px)`;
    } else if (panelHeight === "half") {
      return `${PANEL_HEIGHTS.half}%`;
    } else {
      return `${100 - PANEL_HEIGHTS.full}%`;
    }
  };

  // 핸들 바에만 수직 스와이프 적용
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
      // 드래그 끝나면 가장 가까운 높이로 스냅
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

  // 콘텐츠 영역에만 수평 스와이프 적용
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
      {/* 3D 미리보기 (전체 화면) */}
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
        />
        <ColorPalette />
      </div>

      {/* 슬라이드 패널 */}
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
          transition: isDragging ? "none" : "top 0.3s ease-out",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 핸들 바 */}
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
          {/* 드래그 핸들 */}
          <div
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "#ccc",
              borderRadius: "2px",
            }}
          />

          {/* 페이지 인디케이터 */}
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
                border: activeTab === "edit" ? "none" : "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                backgroundColor: activeTab === "edit" ? "#333" : "rgba(255, 255, 255, 0.5)",
                color: activeTab === "edit" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow: activeTab === "edit" ? "none" : "0 0 4px rgba(255,255,255,0.9)",
              }}
            >
              ✏️ 편집
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                border: activeTab === "cart" ? "none" : "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "16px",
                backgroundColor: activeTab === "cart" ? "#333" : "rgba(255, 255, 255, 0.5)",
                color: activeTab === "cart" ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.2s",
                textShadow: activeTab === "cart" ? "none" : "0 0 4px rgba(255,255,255,0.9)",
              }}
            >
              🛒 장바구니
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 (스크롤 가능) */}
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
            {/* 편집 패널 */}
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

            {/* 장바구니 패널 */}
            <div
              style={{
                width: "50%",
                height: "100%",
                overflow: "auto",
                WebkitOverflowScrolling: "touch",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              }}
            >
              <RightPanel onCheckout={onCheckout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
