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
  const sceneOpacity = interpolate(frame, [0, 12, 215, 230], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Magnetic snap happens at frame 45 with high tension inertia
  const snapSpring = spring({
    frame: frame - 40,
    fps,
    config: THEME.springs.magneticSnap,
  });

  // 1. Sudadera (Torso / Top)
  // Flies in from top-left with rotation, locks perfectly into center torso
  const sudaderaX = interpolate(snapSpring, [0, 1], [-450, 0]);
  const sudaderaY = interpolate(snapSpring, [0, 1], [-550, -190]);
  const sudaderaRotate = interpolate(snapSpring, [0, 1], [-28, 0]);
  const sudaderaScale = interpolate(snapSpring, [0, 1], [0.75, 1]);

  // 2. Pantalón (Piernas / Bottom)
  // Flies in from bottom-right, tucks its waistband 30px under the hoodie hem
  const pantalonX = interpolate(snapSpring, [0, 1], [450, 0]);
  const pantalonY = interpolate(snapSpring, [0, 1], [600, 120]);
  const pantalonRotate = interpolate(snapSpring, [0, 1], [25, 0]);
  const pantalonScale = interpolate(snapSpring, [0, 1], [0.75, 1]);

  // 3. New Balance (Calzado / Shoes)
  // Flies in from bottom-left, settles directly beneath the pant cuffs
  const shoesX = interpolate(snapSpring, [0, 1], [-350, 0]);
  const shoesY = interpolate(snapSpring, [0, 1], [700, 420]);
  const shoesRotate = interpolate(snapSpring, [0, 1], [-18, 0]);
  const shoesScale = interpolate(snapSpring, [0, 1], [0.7, 1]);

  // 4. Reloj (Accesorio / Wrist)
  // Flies in from top-right, settles at left wrist position
  const relojX = interpolate(snapSpring, [0, 1], [380, -250]);
  const relojY = interpolate(snapSpring, [0, 1], [-450, -120]);
  const relojRotate = interpolate(snapSpring, [0, 1], [32, 0]);
  const relojScale = interpolate(snapSpring, [0, 1], [0.65, 1]);

  // Massive Flash on Impact (Frames 44 - 58)
  const flashOpacity = interpolate(frame, [43, 46, 58], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Specular light sweep across the completed outfit (Frames 60 - 110)
  const sweepX = interpolate(frame, [60, 110], [-500, 500], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Single Monolithic Text (Frames 90 - 220): "Tu outfit. Resuelto."
  const showText = frame >= 85;
  const textSpring = spring({
    frame: frame - 88,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [35, 0]);
  const textOpacity = interpolate(frame, [85, 96, 210, 225], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera slow push
  const cameraZoom = interpolate(frame, [0, 230], [1, 1.08]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <CinematicBackground accentIntensity={0.25} glowY={52} />

      {/* Impact White Flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFFFFF',
          opacity: flashOpacity,
          pointerEvents: 'none',
          zIndex: 80,
        }}
      />

      {/* Central Mannequin / Outfit Assembly Stage */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${cameraZoom})`,
          width: 820,
          height: 1180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30,
        }}
      >
        {/* Layer 1: Pantalón (Lower Body, zIndex 10) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            transform: `translate(${pantalonX}px, ${pantalonY}px) rotate(${pantalonRotate}deg) scale(${pantalonScale})`,
            width: 440,
            height: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 30px 45px rgba(0, 0, 0, 0.85))',
          }}
        >
          <Img
            src={staticFile('pantalon.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Layer 2: Sudadera (Torso, zIndex 20 - Overlaps the waistband of pants) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            transform: `translate(${sudaderaX}px, ${sudaderaY}px) rotate(${sudaderaRotate}deg) scale(${sudaderaScale})`,
            width: 530,
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.9))',
          }}
        >
          <Img
            src={staticFile('sudadera.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Layer 3: New Balance 550 (Feet, zIndex 15 - Positioned at pant hem) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 15,
            transform: `translate(${shoesX}px, ${shoesY}px) rotate(${shoesRotate}deg) scale(${shoesScale})`,
            width: 330,
            height: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8))',
          }}
        >
          <Img
            src={staticFile('new balance.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Layer 4: Reloj (Wrist accessory, zIndex 25) */}
        <div
          style={{
            position: 'absolute',
            zIndex: 25,
            transform: `translate(${relojX}px, ${relojY}px) rotate(${relojRotate}deg) scale(${relojScale})`,
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.9))',
          }}
        >
          <Img
            src={staticFile('reloj.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Specular Light Sweep across the whole outfit */}
        {frame >= 60 && frame <= 110 && (
          <div
            style={{
              position: 'absolute',
              top: -100,
              bottom: -100,
              left: sweepX,
              width: 100,
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              transform: 'skewX(-25deg)',
              pointerEvents: 'none',
              zIndex: 40,
            }}
          />
        )}
      </div>

      {/* SINGLE TEXT DISPLAY: "Tu outfit. Resuelto." (Zero Pills, Monolithic Apple) */}
      {showText && (
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            width: '100%',
            textAlign: 'center',
            zIndex: 50,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
          }}
        >
          <h1
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: THEME.typography.trackingTight,
              color: THEME.colors.textPrimary,
              margin: 0,
            }}
          >
            Tu outfit. Resuelto.
          </h1>
        </div>
      )}
    </AbsoluteFill>
  );
};
