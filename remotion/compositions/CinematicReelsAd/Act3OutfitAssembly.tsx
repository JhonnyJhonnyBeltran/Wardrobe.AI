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

export const Act3OutfitAssembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 15, 220, 240], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Entrance of loose items (Frames 0 - 55)
  // Magnetic snap impact at Frame 75
  const snapSpring = spring({
    frame: frame - 60,
    fps,
    config: THEME.springs.magneticSnap,
  });

  // Sudadera (Torso)
  const sudaderaY = interpolate(snapSpring, [0, 1], [-480, -180]);
  const sudaderaX = interpolate(snapSpring, [0, 1], [-280, 0]);
  const sudaderaRotate = interpolate(snapSpring, [0, 1], [-25, 0]);
  const sudaderaScale = interpolate(snapSpring, [0, 1], [0.75, 1.1]);

  // Pantalón (Piernas)
  const pantalonY = interpolate(snapSpring, [0, 1], [420, 120]);
  const pantalonX = interpolate(snapSpring, [0, 1], [280, 0]);
  const pantalonRotate = interpolate(snapSpring, [0, 1], [22, 0]);
  const pantalonScale = interpolate(snapSpring, [0, 1], [0.75, 1.15]);

  // Zapatillas New Balance (Calzado)
  const shoesY = interpolate(snapSpring, [0, 1], [600, 390]);
  const shoesX = interpolate(snapSpring, [0, 1], [-260, 0]);
  const shoesRotate = interpolate(snapSpring, [0, 1], [-18, 0]);
  const shoesScale = interpolate(snapSpring, [0, 1], [0.7, 1.05]);

  // Reloj (Accesorio lateral)
  const relojY = interpolate(snapSpring, [0, 1], [-380, -210]);
  const relojX = interpolate(snapSpring, [0, 1], [320, 260]);
  const relojRotate = interpolate(snapSpring, [0, 1], [30, 0]);
  const relojScale = interpolate(snapSpring, [0, 1], [0.65, 0.95]);

  // Flash impact at frame 75
  const flashOpacity = interpolate(frame, [72, 78, 92], [0, 0.85, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Backplate glass container appearance
  const cardOpacity = interpolate(snapSpring, [0, 1], [0, 1]);
  const cardScale = interpolate(snapSpring, [0, 1], [0.88, 1]);

  // Badge Spring (Frame 85+)
  const badgeSpring = spring({
    frame: frame - 85,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const badgeY = interpolate(badgeSpring, [0, 1], [40, 0]);
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1]);

  // Camera slow cinematic push
  const cameraZoom = interpolate(frame, [0, 240], [1, 1.07]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <CinematicBackground accentIntensity={0.25} glowY={50} />

      {/* Impact Flash Effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFFFFF',
          opacity: flashOpacity,
          pointerEvents: 'none',
          zIndex: 60,
        }}
      />

      {/* Top Section Header */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          width: '100%',
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: THEME.colors.brandPink,
            letterSpacing: THEME.typography.trackingBadge,
            textTransform: 'uppercase',
            margin: '0 0 10px 0',
          }}
        >
          {frame < 75 ? 'Seleccionando de tu armario' : 'Outfit ensamblado'}
        </p>
        <h2
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: THEME.colors.textPrimary,
            letterSpacing: THEME.typography.trackingHeadline,
            margin: 0,
          }}
        >
          {frame < 75 ? 'Piezas sueltas...' : 'Un look perfecto.'}
        </h2>
      </div>

      {/* Central Outfit Assembly Area */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${cameraZoom})`,
          width: 780,
          height: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30,
        }}
      >
        {/* Backplate Glass Canvas */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 48,
            backgroundColor: THEME.colors.glassBg,
            backdropFilter: 'blur(35px)',
            border: `1px solid ${THEME.colors.borderPink}`,
            boxShadow:
              '0 40px 100px rgba(0, 0, 0, 0.85), 0 0 60px rgba(255, 102, 196, 0.2)',
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            zIndex: 1,
          }}
        />

        {/* 1. Sudadera (Torso) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            transform: `translate(${sudaderaX}px, ${sudaderaY}px) rotate(${sudaderaRotate}deg) scale(${sudaderaScale})`,
            filter: 'drop-shadow(0 25px 40px rgba(0, 0, 0, 0.75))',
            width: 440,
            height: 340,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('sudadera.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 60 && (
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: -30,
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Sudadera Oversize
            </div>
          )}
        </div>

        {/* 2. Pantalón (Piernas) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 8,
            transform: `translate(${pantalonX}px, ${pantalonY}px) rotate(${pantalonRotate}deg) scale(${pantalonScale})`,
            filter: 'drop-shadow(0 25px 40px rgba(0, 0, 0, 0.75))',
            width: 420,
            height: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('pantalon.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 60 && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: -40,
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Pantalón Carpintero
            </div>
          )}
        </div>

        {/* 3. New Balance (Zapatillas) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 9,
            transform: `translate(${shoesX}px, ${shoesY}px) rotate(${shoesRotate}deg) scale(${shoesScale})`,
            filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8))',
            width: 320,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('new balance.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 60 && (
            <div
              style={{
                position: 'absolute',
                bottom: -10,
                left: -20,
                padding: '6px 16px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              New Balance 550
            </div>
          )}
        </div>

        {/* 4. Reloj (Accesorio) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 12,
            transform: `translate(${relojX}px, ${relojY}px) rotate(${relojRotate}deg) scale(${relojScale})`,
            filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.85))',
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('reloj.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Floating Verified Badge (pops in after snap) */}
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            zIndex: 35,
            padding: '16px 36px',
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            color: '#000000',
            fontWeight: 800,
            fontSize: 20,
            boxShadow:
              '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(255, 102, 196, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ color: THEME.colors.brandPink, fontSize: 24 }}>✓</span>
          <span>Look Street Minimal</span>
          <span
            style={{
              fontSize: 14,
              padding: '4px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              fontWeight: 700,
            }}
          >
            Afinidad 100%
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
