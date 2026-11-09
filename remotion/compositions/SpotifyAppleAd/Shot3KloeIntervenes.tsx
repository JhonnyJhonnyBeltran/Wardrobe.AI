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

interface FrozenItem {
  src: string;
  x: number;
  y: number;
  z: number;
  rotateZ: number;
  scale: number;
  size: number;
}

const FROZEN_ITEMS: FrozenItem[] = [
  {
    src: 'ad-assets/prenda-top-negro.png',
    x: -240,
    y: -140,
    z: 20,
    rotateZ: -12,
    scale: 0.95,
    size: 240,
  },
  {
    src: 'ad-assets/prenda-vaquero.png',
    x: 230,
    y: 130,
    z: -30,
    rotateZ: 14,
    scale: 0.95,
    size: 260,
  },
  {
    src: 'sudadera.png',
    x: 210,
    y: -220,
    z: 60,
    rotateZ: 18,
    scale: 0.85,
    size: 220,
  },
  {
    src: 'pantalon.png',
    x: -220,
    y: 220,
    z: 10,
    rotateZ: -16,
    scale: 0.85,
    size: 230,
  },
  {
    src: 'new balance.png',
    x: -90,
    y: 350,
    z: 100,
    rotateZ: 8,
    scale: 0.75,
    size: 180,
  },
  {
    src: 'reloj.png',
    x: 140,
    y: -40,
    z: 140,
    rotateZ: -22,
    scale: 0.7,
    size: 150,
  },
];

export const Shot3KloeIntervenes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade transition
  const sceneOpacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Clothes freeze & gentle suspension float
  const freezeSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90, mass: 1 },
  });
  const clothesBlur = interpolate(freezeSpring, [0, 1], [8, 0]);

  // Kloe entrance spring: descends with confidence from top
  const kloeSpring = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.kloeBouncy,
  });
  const kloeY = interpolate(kloeSpring, [0, 1], [-300, 0]);
  const kloeScale = interpolate(kloeSpring, [0, 1], [0.4, 1]);
  const kloeIdleHover = Math.sin(frame * 0.08) * 8;

  // Single monolithic text: "Déjamelo a mí."
  const textSpring = spring({
    frame: frame - 35,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(frame, [35, 50, 160, 175], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Aura pulse
  const auraScale = interpolate(frame, [0, 180], [0.85, 1.15]);
  const auraOpacity = interpolate(frame, [15, 45], [0, 0.45], {
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
      {/* Dynamic Pink Mascot Aura */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${auraScale})`,
          width: 850,
          height: 850,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.3) 0%, rgba(255, 102, 196, 0.08) 50%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: auraOpacity,
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
          height: '42%',
          background: 'linear-gradient(to bottom, transparent, rgba(12, 12, 16, 0.96))',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          pointerEvents: 'none',
        }}
      />

      {/* Suspended Clothes in Frozen 3D Space */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          width: 0,
          height: 0,
          transform: 'perspective(1200px) rotateX(8deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {FROZEN_ITEMS.map((item, idx) => {
          const itemHover = Math.sin(frame * 0.05 + idx) * 12;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: item.x - item.size / 2,
                top: item.y - item.size / 2 + itemHover,
                transform: `translateZ(${item.z}px) rotateZ(${item.rotateZ}deg) scale(${item.scale})`,
                width: item.size,
                height: item.size,
                filter: `blur(${clothesBlur}px) drop-shadow(0 30px 40px rgba(0, 0, 0, 0.9))`,
                opacity: 0.75,
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

      {/* Kloe Mascot Hero Centerpiece */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${kloeY + kloeIdleHover}px) scale(${kloeScale})`,
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 102, 196, 0.22) 0%, transparent 75%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('kloe-avatar.png')}
            style={{
              width: 220,
              height: 220,
              objectFit: 'contain',
              filter: 'drop-shadow(0 25px 50px rgba(255, 102, 196, 0.55)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.9))',
            }}
          />
        </div>
      </div>

      {/* Single Monolithic Text: "Déjamelo a mí." */}
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
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
            textShadow: '0 10px 35px rgba(0,0,0,0.9)',
          }}
        >
          Déjamelo a mí.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
