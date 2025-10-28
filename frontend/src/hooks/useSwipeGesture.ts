import { useRef, useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDragMove?: (deltaY: number) => void;
  onDragEnd?: () => void;
  verticalThreshold?: number;
  horizontalThreshold?: number;
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement>,
  options: SwipeGestureOptions
) {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onDragMove,
    onDragEnd,
    verticalThreshold = 50,
    horizontalThreshold = 80,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || !isDraggingRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 수직 드래그 중 실시간 이동
      if (onDragMove && Math.abs(deltaY) > Math.abs(deltaX)) {
        e.preventDefault();
        onDragMove(deltaY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !isDraggingRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 수직 스와이프 (패널 열기/닫기)
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < -verticalThreshold && onSwipeUp) {
          onSwipeUp();
        } else if (deltaY > verticalThreshold && onSwipeDown) {
          onSwipeDown();
        }
      }
      // 수평 스와이프 (편집/장바구니 전환)
      else if (Math.abs(deltaX) > horizontalThreshold) {
        if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }

      if (onDragEnd) {
        onDragEnd();
      }

      touchStartRef.current = null;
      isDraggingRef.current = false;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    elementRef,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onDragMove,
    onDragEnd,
    verticalThreshold,
    horizontalThreshold,
  ]);
}
