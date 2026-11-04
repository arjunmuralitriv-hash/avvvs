import { useEffect, useRef, useState, useCallback } from "react";

export function useZoomPan({ maxScale = 3 }: { maxScale?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.5, maxScale));
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s / 1.5, 1);
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    startPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPos({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.002);
      setScale((s) => {
        const next = Math.min(Math.max(s * factor, 1), maxScale);
        if (next === 1) setPos({ x: 0, y: 0 });
        return next;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [maxScale]);

  return {
    ref,
    scale,
    pos,
    zoomIn,
    zoomOut,
    reset,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

