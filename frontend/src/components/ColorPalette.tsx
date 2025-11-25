import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDesignStore } from '../store/useDesignStore';
import { useIsMobile } from '../hooks/useMediaQuery';

export const ColorPalette = () => {
  const selectedPlateId = useDesignStore((state) => state.selectedPlateId);
  const plates = useDesignStore((state) => state.plates);
  const backgroundColor = useDesignStore((state) => state.backgroundColor);
  const updateSelectedPlateColor = useDesignStore((state) => state.updateSelectedPlateColor);
  const updateSelectedQrColor = useDesignStore((state) => state.updateSelectedQrColor);
  const setBackgroundColor = useDesignStore((state) => state.setBackgroundColor);

  const isMobile = useIsMobile();

  // Color picker modal state
  const [showColorModal, setShowColorModal] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<'plate' | 'qr' | 'bg'>('plate');
  const [colorModalPos, setColorModalPos] = useState(() => {
    const saved = localStorage.getItem('colorPickerModalPosition');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const selectedPlate = selectedPlateId ? plates.find(p => p.id === selectedPlateId) : null;

  // Save modal position to localStorage
  useEffect(() => {
    localStorage.setItem('colorPickerModalPosition', JSON.stringify(colorModalPos));
  }, [colorModalPos]);

  // Prevent scroll while dragging
  useEffect(() => {
    if (isDraggingModal) {
      const preventScroll = (e: TouchEvent) => e.preventDefault();
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.removeEventListener('touchmove', preventScroll);
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      };
    }
  }, [isDraggingModal]);

  // Close modal on outside click
  useEffect(() => {
    if (!showColorModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-color-modal]')) {
        setShowColorModal(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorModal]);

  const openColorPicker = (tab: 'plate' | 'qr' | 'bg') => {
    setActiveColorTab(tab);
    setShowColorModal(true);
  };

  const getTabLabel = () => {
    switch (activeColorTab) {
      case 'plate': return 'Plate Color';
      case 'qr': return 'QR Color';
      case 'bg': return 'Background';
    }
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: isMobile ? '50%' : '20px',
          left: isMobile ? 'auto' : '50%',
          right: isMobile ? '10px' : 'auto',
          transform: isMobile ? 'translateY(-50%)' : 'translateX(-50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '6px' : '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: isMobile ? '6px' : '10px 20px',
          borderRadius: isMobile ? '20px' : '50px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          userSelect: 'none',
        }}
      >
        {/* Plate Color */}
        {selectedPlate && (
          <button
            onClick={() => openColorPicker('plate')}
            style={{
              width: isMobile ? '32px' : '40px',
              height: isMobile ? '32px' : '40px',
              minWidth: isMobile ? '32px' : '40px',
              minHeight: isMobile ? '32px' : '40px',
              borderRadius: '50%',
              background: selectedPlate.plateColor,
              border: isMobile ? '2px solid #ddd' : '3px solid #ddd',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Plate Color"
          />
        )}

        {/* QR Color */}
        {selectedPlate && (
          <button
            onClick={() => openColorPicker('qr')}
            style={{
              width: isMobile ? '32px' : '40px',
              height: isMobile ? '32px' : '40px',
              minWidth: isMobile ? '32px' : '40px',
              minHeight: isMobile ? '32px' : '40px',
              borderRadius: '50%',
              background: selectedPlate.qrColor,
              border: isMobile ? '2px solid #ddd' : '3px solid #ddd',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="QR Color"
          />
        )}

        {/* Background Color */}
        <button
          onClick={() => openColorPicker('bg')}
          style={{
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            minWidth: isMobile ? '32px' : '40px',
            minHeight: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            background: backgroundColor,
            border: isMobile ? '2px solid #ddd' : '3px solid #ddd',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Background Color"
        />
      </div>

      {/* Color Picker Modal */}
      {showColorModal && (
        <div
          data-color-modal
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${colorModalPos.x}px), calc(-50% + ${colorModalPos.y}px))`,
            backgroundColor: 'white',
            padding: '16px',
            paddingTop: '28px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            userSelect: 'none',
            zIndex: 2000,
          }}
          onMouseDown={(e) => {
            setIsDraggingModal(true);
            setDragStart({ x: e.clientX - colorModalPos.x, y: e.clientY - colorModalPos.y });
          }}
          onMouseMove={(e) => {
            if (isDraggingModal) {
              setColorModalPos({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
              });
            }
          }}
          onMouseUp={() => setIsDraggingModal(false)}
          onMouseLeave={() => setIsDraggingModal(false)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            setIsDraggingModal(true);
            setDragStart({ x: touch.clientX - colorModalPos.x, y: touch.clientY - colorModalPos.y });
          }}
          onTouchMove={(e) => {
            if (isDraggingModal) {
              const touch = e.touches[0];
              setColorModalPos({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
              });
            }
          }}
          onTouchEnd={() => setIsDraggingModal(false)}
        >
          {/* Drag handle with label */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '24px',
              cursor: isDraggingModal ? 'grabbing' : 'grab',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: '#999', fontWeight: 500 }}>
              {getTabLabel()}
            </span>
          </div>

          {/* Color Picker */}
          <div
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <HexColorPicker
              color={
                activeColorTab === 'plate' && selectedPlate ? selectedPlate.plateColor :
                activeColorTab === 'qr' && selectedPlate ? selectedPlate.qrColor :
                backgroundColor
              }
              onChange={(color) => {
                if (activeColorTab === 'plate' && selectedPlate) {
                  updateSelectedPlateColor(color);
                } else if (activeColorTab === 'qr' && selectedPlate) {
                  updateSelectedQrColor(color);
                } else {
                  setBackgroundColor(color);
                }
              }}
              style={{ width: '180px', height: '180px' }}
            />
          </div>
        </div>
      )}
    </>
  );
};
