'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface PinchZoomPhotoProps {
  children: React.ReactNode;
  className?: string;
  /** Reset transform when slide index or key changes */
  resetKey?: string | number;
  /** Notify parent carousel when zoomed (> 1.02) so horizontal swipe locks cleanly */
  onZoomChange?: (isZoomed: boolean) => void;
  maxScale?: number;
}

interface TransformState {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const ZOOM_THRESHOLD = 1.02;

function getTouchDistance(t1: Touch, t2: Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

function getTouchMidpoint(t1: Touch, t2: Touch, rect: DOMRect): { x: number; y: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    x: (t1.clientX + t2.clientX) / 2 - cx,
    y: (t1.clientY + t2.clientY) / 2 - cy,
  };
}

/**
 * Native-feeling 2-finger pinch-to-zoom + 1-finger pan container for mobile post photos.
 * Uses non-passive touchmove listeners so horizontal carousels and page zoom never hijack active pinches.
 */
export default function PinchZoomPhoto({
  children,
  className = '',
  resetKey,
  onZoomChange,
  maxScale = 3.5,
}: PinchZoomPhotoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<TransformState>({ scale: 1, x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const transformRef = useRef<TransformState>(transform);
  transformRef.current = transform;

  const gestureRef = useRef({
    mode: 'none' as 'none' | 'pinch' | 'pan',
    startDist: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    startMidX: 0,
    startMidY: 0,
    panStartClientX: 0,
    panStartClientY: 0,
    moved: false,
    wasPinchOrPan: false,
    lastTapAt: 0,
  });

  const clampPan = useCallback((x: number, y: number, scale: number, rect: DOMRect) => {
    if (scale <= MIN_SCALE) return { x: 0, y: 0 };
    const maxX = (rect.width * (scale - 1)) / 2;
    const maxY = (rect.height * (scale - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const resetZoom = useCallback(() => {
    setIsInteracting(false);
    setTransform({ scale: 1, x: 0, y: 0 });
    onZoomChange?.(false);
  }, [onZoomChange]);

  useEffect(() => {
    resetZoom();
  }, [resetKey, resetZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const g = gestureRef.current;
      const cur = transformRef.current;

      if (e.touches.length === 2) {
        const rect = el.getBoundingClientRect();
        const mid = getTouchMidpoint(e.touches[0], e.touches[1], rect);
        g.mode = 'pinch';
        g.startDist = Math.max(1, getTouchDistance(e.touches[0], e.touches[1]));
        g.startScale = cur.scale;
        g.startX = cur.x;
        g.startY = cur.y;
        g.startMidX = mid.x;
        g.startMidY = mid.y;
        g.wasPinchOrPan = true;
        g.moved = true;
        setIsInteracting(true);
      } else if (e.touches.length === 1 && cur.scale > ZOOM_THRESHOLD) {
        g.mode = 'pan';
        g.startX = cur.x;
        g.startY = cur.y;
        g.panStartClientX = e.touches[0].clientX;
        g.panStartClientY = e.touches[0].clientY;
        g.moved = false;
        g.wasPinchOrPan = true;
        setIsInteracting(true);
      } else if (e.touches.length === 1) {
        g.mode = 'none';
        g.moved = false;
        g.wasPinchOrPan = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current;

      if (e.touches.length === 2) {
        if (g.mode !== 'pinch') {
          const rect = el.getBoundingClientRect();
          const mid = getTouchMidpoint(e.touches[0], e.touches[1], rect);
          g.mode = 'pinch';
          g.startDist = Math.max(1, getTouchDistance(e.touches[0], e.touches[1]));
          g.startScale = transformRef.current.scale;
          g.startX = transformRef.current.x;
          g.startY = transformRef.current.y;
          g.startMidX = mid.x;
          g.startMidY = mid.y;
          g.wasPinchOrPan = true;
          setIsInteracting(true);
        }

        if (e.cancelable) e.preventDefault();
        e.stopPropagation();

        const rect = el.getBoundingClientRect();
        const dist = getTouchDistance(e.touches[0], e.touches[1]);
        const mid = getTouchMidpoint(e.touches[0], e.touches[1], rect);
        const nextScale = Math.max(MIN_SCALE, Math.min(maxScale, g.startScale * (dist / g.startDist)));

        // Keep the pinch focal point anchored beneath the user's fingers
        const anchorX = (g.startMidX - g.startX) / g.startScale;
        const anchorY = (g.startMidY - g.startY) / g.startScale;
        const rawX = mid.x - anchorX * nextScale;
        const rawY = mid.y - anchorY * nextScale;
        const clamped = clampPan(rawX, rawY, nextScale, rect);

        const next = { scale: nextScale, x: clamped.x, y: clamped.y };
        transformRef.current = next;
        setTransform(next);
        onZoomChange?.(nextScale > ZOOM_THRESHOLD);
        return;
      }

      if (e.touches.length === 1 && g.mode === 'pan' && transformRef.current.scale > ZOOM_THRESHOLD) {
        const dx = e.touches[0].clientX - g.panStartClientX;
        const dy = e.touches[0].clientY - g.panStartClientY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          g.moved = true;
        }
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();

        const rect = el.getBoundingClientRect();
        const clamped = clampPan(g.startX + dx, g.startY + dy, transformRef.current.scale, rect);
        const next = { scale: transformRef.current.scale, x: clamped.x, y: clamped.y };
        transformRef.current = next;
        setTransform(next);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;

      if (e.touches.length === 1 && g.mode === 'pinch') {
        // One finger lifted during pinch; transition smoothly into pan if zoomed
        if (transformRef.current.scale > ZOOM_THRESHOLD) {
          g.mode = 'pan';
          g.startX = transformRef.current.x;
          g.startY = transformRef.current.y;
          g.panStartClientX = e.touches[0].clientX;
          g.panStartClientY = e.touches[0].clientY;
        } else {
          g.mode = 'none';
          resetZoom();
        }
        e.stopPropagation();
        return;
      }

      if (e.touches.length === 0) {
        const wasZooming = g.wasPinchOrPan;
        const wasDrag = g.moved;
        const isZoomed = transformRef.current.scale > ZOOM_THRESHOLD;
        g.mode = 'none';
        setIsInteracting(false);

        if (!isZoomed) {
          resetZoom();
        } else if (!wasDrag) {
          // Double-tap while zoomed resets cleanly instead of triggering like
          const now = Date.now();
          if (now - g.lastTapAt < 280) {
            g.lastTapAt = 0;
            resetZoom();
          } else {
            g.lastTapAt = now;
          }
        }

        if (wasZooming || wasDrag || isZoomed) {
          e.stopPropagation();
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [clampPan, maxScale, onZoomChange, resetZoom]);

  const isZoomed = transform.scale > ZOOM_THRESHOLD;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ touchAction: isZoomed ? 'none' : 'pan-x pan-y' }}
    >
      <div
        className={`w-full h-full flex items-center justify-center transform-gpu will-change-transform ${
          isInteracting ? '' : 'transition-transform duration-200 ease-out'
        }`}
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        }}
      >
        {children}
      </div>

      {isZoomed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          className="md:hidden absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold tracking-tight border border-white/15 shadow-sm active:scale-95 transition-transform cursor-pointer"
          aria-label="Restablecer zoom"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{transform.scale.toFixed(1)}×</span>
        </button>
      )}
    </div>
  );
}
