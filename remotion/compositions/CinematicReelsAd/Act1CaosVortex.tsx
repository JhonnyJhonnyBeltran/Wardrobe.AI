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
import { CinematicBackground } from '../../components/CinematicBackground';
import { THEME } from '../../theme';

interface FloatingGarment {
  src: string;
  initialAngle: number;
  radiusX: number;
  radiusY: number;
  speed: number;
  size: number;
  depthZ: number;
  rotSpeed: number;
}

const VORTEX_ITEMS: FloatingGarment[] = [
  { src: 'sudadera.png', initialAngle: 0, radiusX: 380, radiusY: 540, speed: 0.04, size: 260, depthZ: 120, rotSpeed: 1.4 },
  { src: 'pantalon.png', initialAngle: 50, radiusX: 340, radiusY: 480, speed: -0.035, size: 240, depthZ: -60, rotSpeed: -1.8 },
  { src: 'new balance.png', initialAngle: 100, radiusX: 420, radiusY: 580, speed: 0.038, size: 200, depthZ: 60, rotSpeed: 2.1 },
  { src: 'reloj.png', initialAngle: 145, radiusX: 290, radiusY: 420, speed: -0.045, size: 140, depthZ: 160, rotSpeed: -2.5 },
  { src: 'sudadera.png', initialAngle: 190, radiusX: 390, radiusY: 510, speed: 0.032, size: 270, depthZ: -120, rotSpeed: 1.3 },
  { src: 'pantalon.png', initialAngle: 240, radiusX: 350, radiusY: 490, speed: -0.04, size: 220, depthZ: 90, rotSpeed: -1.9 },
  { src: 'new balance.png', initialAngle: 285, radiusX: 430, radiusY: 550, speed: 0.035, size: 190, depthZ: -90, rotSpeed: 1.6 },
  { src: 'reloj.png', initialAngle: 330, radiusX: 310, radiusY: 430, speed: -0.042, size: 150, depthZ: 130, rotSpeed: 2.3 },
];

export const Act1CaosVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade out right before Act 2
  const sceneOpacity = interpolate(frame, [0, 15, 205, 220], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera continuous push-in for mounting tension
  const cameraZoom = interpolate(frame, [0, 220], [1, 1.15]);

  // Accelerating rotational velocity (centrifugal tension)
  const speedMultiplier = interpolate(frame, [0, 120, 220], [1, 1.6, 3.2]);

  // Phase 1 (Frames 0 - 105): "Tengo muchas prendas."
  const showText1 = frame < 105;
  const text1Spring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const text1Y = interpolate(text1Spring, [0, 1], [45, 0]);
  const text1Opacity = interpolate(frame, [10, 25, 92, 105], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 2 (Frames 105 - 220): "Pero no sé qué ponerme."
  const showText2 = frame >= 105;
  const text2Spring = spring({
    frame: frame - 105,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const text2Y = interpolate(text2Spring, [0, 1], [45, 0]);
  const text2Opacity = interpolate(frame, [105, 118, 205, 220], [0, 1, 1, 0], {
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
      <CinematicBackground accentIntensity={0.18} glowY={50} />

      {/* 3D Vortex of Swirling Clothing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          perspective: 1200,
          transform: `scale(${cameraZoom})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {VORTEX_ITEMS.map((item, index) => {
          const angle =
            item.initialAngle * (Math.PI / 180) +
            frame * item.speed * speedMultiplier;
          const x = Math.cos(angle) * item.radiusX;
          const y = Math.sin(angle) * item.radiusY;
          const rotation = frame * item.rotSpeed * speedMultiplier;
          const depthScale = interpolate(item.depthZ, [-120, 160], [0.75, 1.2]);
          const depthOpacity = interpolate(item.depthZ, [-120, 160], [0.6, 0.95]);

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: item.size,
                height: item.size,
                transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${item.depthZ}px) rotateZ(${rotation}deg) rotateX(${rotation * 0.4}deg) scale(${depthScale})`,
                opacity: depthOpacity,
                filter:
                  item.depthZ < 0
                    ? 'blur(2.5px) drop-shadow(0 20px 30px rgba(0,0,0,0.85))'
                    : 'drop-shadow(0 30px 50px rgba(0,0,0,0.95))',
                pointerEvents: 'none',
              }}
            >
              <Img
                src={staticFile(item.src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Radial vignette for high contrast typography */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* MONOLITHIC SINGLE TEXT DISPLAY (Zero Pills, Pure Typography) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '88%',
          maxWidth: 960,
          textAlign: 'center',
          zIndex: 40,
        }}
      >
        {showText1 && (
          <h1
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: THEME.typography.trackingTight,
              color: THEME.colors.textPrimary,
              margin: 0,
              opacity: text1Opacity,
              transform: `translateY(${text1Y}px)`,
            }}
          >
            Tengo muchas prendas.
          </h1>
        )}

        {showText2 && (
          <h1
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: THEME.typography.trackingTight,
              color: THEME.colors.brandPink,
              textShadow: '0 0 60px rgba(255, 102, 196, 0.6)',
              margin: 0,
              opacity: text2Opacity,
              transform: `translateY(${text2Y}px)`,
            }}
          >
            Pero nunca sé qué ponerme.
          </h1>
        )}
      </div>
    </AbsoluteFill>
  );
};
