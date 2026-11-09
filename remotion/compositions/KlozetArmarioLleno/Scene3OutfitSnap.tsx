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
import { SPRING, TYPE, COLOR } from '../../apple-motion/tokens';

export const Scene3OutfitSnap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Entrance of loose items (Frames 0 - 70)
  // Phase 2: Snap together into unified outfit (Frames 70 - 130)
  const snapProgress = spring({
    frame: frame - 70,
    fps,
    config: { damping: 14, stiffness: 125, mass: 0.8 },
  });

  // Torso / Sudadera
  const sudaderaX = interpolate(snapProgress, [0, 1], [-380, 0]);
  const sudaderaY = interpolate(snapProgress, [0, 1], [-180, -90]);
  const sudaderaRotate = interpolate(snapProgress, [0, 1], [-24, 0]);
  const sudaderaScale = interpolate(snapProgress, [0, 1], [0.85, 1.05]);

  // Legs / Pantalón
  const pantalonX = interpolate(snapProgress, [0, 1], [380, 0]);
  const pantalonY = interpolate(snapProgress, [0, 1], [180, 80]);
  const pantalonRotate = interpolate(snapProgress, [0, 1], [22, 0]);
  const pantalonScale = interpolate(snapProgress, [0, 1], [0.85, 1.05]);

  // Shoes / New Balance
  const shoesX = interpolate(snapProgress, [0, 1], [-320, 0]);
  const shoesY = interpolate(snapProgress, [0, 1], [280, 240]);
  const shoesRotate = interpolate(snapProgress, [0, 1], [-18, 0]);
  const shoesScale = interpolate(snapProgress, [0, 1], [0.8, 1]);

  // Accessory / Reloj
  const relojX = interpolate(snapProgress, [0, 1], [360, 170]);
  const relojY = interpolate(snapProgress, [0, 1], [-220, -110]);
  const relojRotate = interpolate(snapProgress, [0, 1], [25, 0]);
  const relojScale = interpolate(snapProgress, [0, 1], [0.75, 0.95]);

  // Flash impact at frame 85
  const flashOpacity = interpolate(frame, [80, 88, 105], [0, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Outfit Card Glow
  const cardOpacity = interpolate(snapProgress, [0, 1], [0, 1]);
  const cardScale = interpolate(snapProgress, [0, 1], [0.9, 1]);

  // Floating Badge Spring
  const badgeSpring = spring({
    frame: frame - 95,
    fps,
    config: SPRING.textIn,
  });
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeSpring, [0, 1], [30, 0]);

  // Camera slow zoom
  const cameraZoom = interpolate(frame, [0, 270], [1, 1.06]);

  // Scene fade out
  const sceneOpacity = interpolate(frame, [250, 270], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        transform: `scale(${cameraZoom})`,
        overflow: 'hidden',
        fontFamily: TYPE.family,
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.2) 0%, transparent 65%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
        }}
      />

      {/* Impact flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFFFFF',
          opacity: flashOpacity,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      {/* Top Headline */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#FF66C4',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 6px 0',
          }}
        >
          {frame < 80 ? 'Prendas sueltas en tu armario' : 'Outfit perfecto'}
        </p>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLOR.white,
            margin: 0,
            letterSpacing: '-0.025em',
          }}
        >
          {frame < 80
            ? 'Piezas que no sabías cómo combinar'
            : 'Ensamblado al instante.'}
        </h2>
      </div>

      {/* Central Assembly Canvas */}
      <div
        style={{
          position: 'relative',
          width: 520,
          height: 640,
          marginTop: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Assembled Look Glassmorphic Backplate */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 36,
            backgroundColor: 'rgba(18, 18, 22, 0.75)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 102, 196, 0.3)',
            boxShadow:
              '0 40px 100px rgba(0, 0, 0, 0.8), 0 0 60px rgba(255, 102, 196, 0.15)',
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            zIndex: 1,
          }}
        />

        {/* 1. Sudadera (Top Layer) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            transform: `translate(${sudaderaX}px, ${sudaderaY}px) rotate(${sudaderaRotate}deg) scale(${sudaderaScale})`,
            filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.7))',
            width: 250,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('sudadera.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 70 && (
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: -20,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Sudadera Oversize
            </div>
          )}
        </div>

        {/* 2. Pantalón (Bottom Layer) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 8,
            transform: `translate(${pantalonX}px, ${pantalonY}px) rotate(${pantalonRotate}deg) scale(${pantalonScale})`,
            filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.7))',
            width: 230,
            height: 230,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('pantalon.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 70 && (
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: -30,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Pantalón Carpintero
            </div>
          )}
        </div>

        {/* 3. New Balance (Shoes Layer) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 9,
            transform: `translate(${shoesX}px, ${shoesY}px) rotate(${shoesRotate}deg) scale(${shoesScale})`,
            filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.7))',
            width: 170,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('new balance.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 70 && (
            <div
              style={{
                position: 'absolute',
                bottom: -15,
                left: 10,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              New Balance 550
            </div>
          )}
        </div>

        {/* 4. Reloj (Accessory Layer) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 12,
            transform: `translate(${relojX}px, ${relojY}px) rotate(${relojRotate}deg) scale(${relojScale})`,
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8))',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('reloj.png')}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
          />
          {frame < 70 && (
            <div
              style={{
                position: 'absolute',
                top: -15,
                right: -25,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Reloj Automático
            </div>
          )}
        </div>

        {/* Floating Verified Badge (pops in after snap) */}
        <div
          style={{
            position: 'absolute',
            bottom: -32,
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            zIndex: 25,
            padding: '12px 26px',
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            color: '#000000',
            fontWeight: 700,
            fontSize: 15,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 102, 196, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ color: '#FF66C4', fontSize: 18 }}>✓</span>
          <span>Look Completo: Street Minimal</span>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              fontWeight: 600,
            }}
          >
            Afinidad 100%
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
