import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { THEME } from '../../theme';

interface FloatingItem {
  src: string;
  x: number;
  y: number;
  zStart: number;
  zEnd: number;
  rotStart: number;
  rotEnd: number;
  scale: number;
  size: number;
}

const ITEMS: FloatingItem[] = [
  {
    src: 'ad-assets/prenda-top-negro.png',
    x: -220,
    y: -180,
    zStart: -250,
    zEnd: 80,
    rotStart: -18,
    rotEnd: 12,
    scale: 1.1,
    size: 260,
  },
  {
    src: 'ad-assets/prenda-vaquero.png',
    x: 200,
    y: 120,
    zStart: -400,
    zEnd: 40,
    rotStart: 25,
    rotEnd: -10,
    scale: 1.05,
    size: 280,
  },
  {
    src: 'sudadera.png',
    x: 190,
    y: -240,
    zStart: -180,
    zEnd: 120,
    rotStart: -30,
    rotEnd: 20,
    scale: 0.95,
    size: 240,
  },
  {
    src: 'pantalon.png',
    x: -210,
    y: 200,
    zStart: -350,
    zEnd: 60,
    rotStart: 15,
    rotEnd: -25,
    scale: 0.9,
    size: 250,
  },
  {
    src: 'new balance.png',
    x: -80,
    y: 340,
    zStart: -200,
    zEnd: 150,
    rotStart: -45,
    rotEnd: 15,
    scale: 0.85,
    size: 200,
  },
  {
    src: 'reloj.png',
    x: 120,
    y: -60,
    zStart: -120,
    zEnd: 200,
    rotStart: 40,
    rotEnd: -20,
    scale: 0.75,
    size: 160,
  },
];

export const Shot2DilemaVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 15, 145, 160], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera swirl rotation and drift
  const cameraRotateY = interpolate(frame, [0, 160], [-12, 16]);
  const cameraRotateX = interpolate(frame, [0, 160], [10, -5]);

  // Monolithic text animation: "Tengo muchas prendas pero no sé qué ponerme."
  const textSpring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [50, 0]);
  const textOpacity = interpolate(frame, [10, 25, 140, 155], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {/* Background radial ambient aura */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.16) 0%, rgba(30, 30, 42, 0.3) 40%, transparent 70%)',
          filter: 'blur(130px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy dark floor (Spotify 3D signature) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to bottom, transparent, rgba(10, 10, 14, 0.96))',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Clothing Vortex Canvas */}
      <div
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          width: 0,
          height: 0,
          transform: `perspective(1200px) rotateY(${cameraRotateY}deg) rotateX(${cameraRotateX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {ITEMS.map((item, idx) => {
          // Dynamic swirling orbit per item
          const progress = frame / 160;
          const currentZ = interpolate(progress, [0, 1], [item.zStart, item.zEnd]);
          const currentRot = interpolate(progress, [0, 1], [item.rotStart, item.rotEnd]);
          const swirlAngle = progress * Math.PI * 1.5 + (idx * Math.PI) / 3;
          const swirlRadiusX = 140;
          const swirlRadiusY = 90;
          const orbitX = item.x + Math.cos(swirlAngle) * swirlRadiusX;
          const orbitY = item.y + Math.sin(swirlAngle) * swirlRadiusY;
          const itemShadow = Math.max(15, 45 + currentZ * 0.1);

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: orbitX - item.size / 2,
                top: orbitY - item.size / 2,
                transform: `translateZ(${currentZ}px) rotateZ(${currentRot}deg) scale(${item.scale})`,
                transformStyle: 'preserve-3d',
                width: item.size,
                height: item.size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: `drop-shadow(0 ${itemShadow}px ${itemShadow * 1.2}px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(255, 102, 196, 0.15))`,
              }}
            >
              <Img
                src={staticFile(item.src)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Single Monolithic Text: "Tengo muchas prendas pero no sé qué ponerme." */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeBottom,
          left: THEME.layout.safePaddingX,
          right: THEME.layout.safePaddingX,
          textAlign: 'center',
          zIndex: 50,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 66,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
            textShadow: '0 8px 30px rgba(0,0,0,0.85)',
          }}
        >
          Tengo muchas prendas pero no sé qué ponerme.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
