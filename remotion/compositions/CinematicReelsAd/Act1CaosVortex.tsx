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
  { src: 'sudadera.png', initialAngle: 0, radiusX: 380, radiusY: 520, speed: 0.035, size: 220, depthZ: 100, rotSpeed: 1.2 },
  { src: 'pantalon.png', initialAngle: 45, radiusX: 340, radiusY: 460, speed: -0.028, size: 210, depthZ: -50, rotSpeed: -1.5 },
  { src: 'new balance.png', initialAngle: 90, radiusX: 420, radiusY: 560, speed: 0.032, size: 180, depthZ: 50, rotSpeed: 1.8 },
  { src: 'reloj.png', initialAngle: 135, radiusX: 300, radiusY: 400, speed: -0.04, size: 130, depthZ: 150, rotSpeed: -2.2 },
  { src: 'sudadera.png', initialAngle: 180, radiusX: 400, radiusY: 500, speed: 0.026, size: 240, depthZ: -100, rotSpeed: 1.1 },
  { src: 'pantalon.png', initialAngle: 225, radiusX: 360, radiusY: 480, speed: -0.034, size: 195, depthZ: 80, rotSpeed: -1.6 },
  { src: 'new balance.png', initialAngle: 270, radiusX: 440, radiusY: 540, speed: 0.03, size: 175, depthZ: -80, rotSpeed: 1.4 },
  { src: 'reloj.png', initialAngle: 315, radiusX: 320, radiusY: 420, speed: -0.038, size: 140, depthZ: 120, rotSpeed: 2.0 },
];

export const Act1CaosVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene entrance & exit
  const sceneOpacity = interpolate(frame, [0, 15, 190, 210], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera push
  const cameraZoom = interpolate(frame, [0, 210], [1, 1.12]);

  // Accelerating vortex speed
  const speedMultiplier = interpolate(frame, [0, 140, 210], [1, 1.4, 2.8]);

  // Kinetic Text Springs
  // Phrase 1: "Tengo muchas prendas"
  const line1Spring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const line1Y = interpolate(line1Spring, [0, 1], [40, 0]);
  const line1Opacity = interpolate(line1Spring, [0, 1], [0, 1]);

  // Phrase 2: "Pero no sé qué ponerme."
  const line2Spring = spring({
    frame: frame - 55,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const line2Y = interpolate(line2Spring, [0, 1], [40, 0]);
  const line2Opacity = interpolate(line2Spring, [0, 1], [0, 1]);
  const line2Scale = interpolate(line2Spring, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <CinematicBackground accentIntensity={0.16} glowY={52} />

      {/* 3D Vortex Container */}
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

          // Scale according to simulated depth
          const depthScale = interpolate(item.depthZ, [-100, 150], [0.8, 1.15]);
          const depthOpacity = interpolate(item.depthZ, [-100, 150], [0.65, 0.95]);

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
                    ? 'blur(2px) drop-shadow(0 20px 30px rgba(0,0,0,0.8))'
                    : 'drop-shadow(0 25px 45px rgba(0,0,0,0.9))',
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

      {/* Dark Translucent Central Overlay for Typography Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.45) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Hero Typography Container (Safe Vertical Area) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '88%',
          maxWidth: 920,
          textAlign: 'center',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Pill Label */}
        <div
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${THEME.colors.borderGlass}`,
            backdropFilter: 'blur(25px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: interpolate(frame, [5, 22], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: THEME.colors.brandPink,
              boxShadow: `0 0 12px ${THEME.colors.brandPink}`,
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: THEME.typography.trackingBadge,
              textTransform: 'uppercase',
              color: THEME.colors.textSecondary,
            }}
          >
            El dilema cotidiano
          </span>
        </div>

        {/* Line 1: "Tengo muchas prendas" */}
        <h1
          style={{
            fontSize: 74,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
          }}
        >
          Tengo muchas prendas
        </h1>

        {/* Line 2: "pero no sé qué ponerme." */}
        <h2
          style={{
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.brandPink,
            textShadow: '0 0 50px rgba(255, 102, 196, 0.5)',
            margin: 0,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px) scale(${line2Scale})`,
          }}
        >
          pero no sé qué ponerme.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            marginTop: 10,
            fontSize: 24,
            fontWeight: 400,
            color: THEME.colors.textSecondary,
            maxWidth: 640,
            opacity: interpolate(frame, [75, 100], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          El 80% de tu armario se queda sin usar. Hasta ahora.
        </p>
      </div>
    </AbsoluteFill>
  );
};
