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

export const Shot1LogoDark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade transition
  const sceneOpacity = interpolate(frame, [0, 15, 140, 160], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Coin floating in from far away over glossy floor (Spotify Shot 1 style)
  const coinSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
  });
  const coinZ = interpolate(coinSpring, [0, 1], [-400, 0]);
  const coinRotateY = interpolate(frame, [0, 160], [35, -15]);
  const coinRotateX = interpolate(frame, [0, 160], [18, 6]);
  const coinScale = interpolate(coinSpring, [0, 1], [0.65, 1]);
  const idleFloat = Math.sin(frame * 0.05) * 10;

  // Single monolithic text entrance: "Tu armario."
  const textSpring = spring({
    frame: frame - 25,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(frame, [25, 40, 135, 155], [0, 1, 1, 0], {
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
      {/* Ambient background light */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.22) 0%, transparent 65%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy floor reflection (Spotify 3D signature) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '42%',
          background: 'linear-gradient(to bottom, transparent, rgba(12, 12, 16, 0.95))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Floating Coin / Disc Hub */}
      <div
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          transform: `translate(-50%, -50%) perspective(1200px) translateZ(${coinZ}px) rotateY(${coinRotateY}deg) rotateX(${coinRotateX}deg) scale(${coinScale}) translateY(${idleFloat}px)`,
          transformStyle: 'preserve-3d',
          width: 280,
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Thick 3D Coin Body */}
        <div
          style={{
            position: 'relative',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22222a 0%, #0d0d12 60%, #1a1a24 100%)',
            boxShadow:
              '0 40px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 102, 196, 0.35), inset 0 0 0 3px rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('klozet-bubble-pink.png')}
            style={{
              width: 170,
              height: 170,
              objectFit: 'contain',
              filter: 'drop-shadow(0 15px 30px rgba(255, 102, 196, 0.5))',
            }}
          />
        </div>
      </div>

      {/* Single Monolithic Text: "Tu armario." */}
      <div
        style={{
          position: 'absolute',
          bottom: 240,
          width: '100%',
          textAlign: 'center',
          zIndex: 40,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
          }}
        >
          Tu armario.
        </h1>
      </div>
    </AbsoluteFill>
  );
};
