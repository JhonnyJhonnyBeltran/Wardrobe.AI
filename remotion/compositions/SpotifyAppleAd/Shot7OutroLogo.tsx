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

export const Shot7OutroLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in / fade out to black at the end
  const sceneOpacity = interpolate(frame, [0, 15, 145, 170], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D Coin rises from depth to front-on (Spotify Shot 7/8)
  const coinSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1 },
  });
  const coinY = interpolate(coinSpring, [0, 1], [180, 0]);
  const coinRotateY = interpolate(coinSpring, [0, 1], [25, 0]);
  const coinRotateX = interpolate(coinSpring, [0, 1], [15, 0]);
  const coinScale = interpolate(coinSpring, [0, 1], [0.8, 1]);

  // Pulse wave rings emitting from the logo
  const ring1Scale = interpolate(frame, [20, 90], [1, 2.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ring1Opacity = interpolate(frame, [20, 35, 90], [0, 0.45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ring2Scale = interpolate(frame, [45, 115], [1, 2.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ring2Opacity = interpolate(frame, [45, 60, 115], [0, 0.35, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Specular sweep across the bubble logo
  const sheenProgress = interpolate(frame, [30, 90], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Monolithic Text Spring: "Tu estilo. Tu Klozet."
  const textSpring = spring({
    frame: frame - 25,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(frame, [25, 40, 145, 165], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle / URL spring: "klozet.es"
  const urlSpring = spring({
    frame: frame - 45,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const urlY = interpolate(urlSpring, [0, 1], [30, 0]);
  const urlOpacity = interpolate(frame, [45, 60, 145, 165], [0, 1, 1, 0], {
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
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.22) 0%, rgba(20, 20, 30, 0.35) 50%, transparent 70%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy dark floor reflection */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '42%',
          background: 'linear-gradient(to bottom, transparent, rgba(10, 10, 14, 0.98))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Coin & Pulse Stage */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: `translate(-50%, -50%) perspective(1200px) translateY(${coinY}px) rotateY(${coinRotateY}deg) rotateX(${coinRotateX}deg) scale(${coinScale})`,
          transformStyle: 'preserve-3d',
          width: 320,
          height: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulse Ring 1 */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '2px solid rgba(255, 102, 196, 0.7)',
            transform: `scale(${ring1Scale})`,
            opacity: ring1Opacity,
            pointerEvents: 'none',
          }}
        />

        {/* Pulse Ring 2 */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '2px solid rgba(255, 102, 196, 0.5)',
            transform: `scale(${ring2Scale})`,
            opacity: ring2Opacity,
            pointerEvents: 'none',
          }}
        />

        {/* Thick 3D Coin Body */}
        <div
          style={{
            position: 'relative',
            width: 270,
            height: 270,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22222a 0%, #0d0d12 60%, #1a1a24 100%)',
            boxShadow:
              '0 40px 90px rgba(0, 0, 0, 0.95), 0 0 60px rgba(255, 102, 196, 0.4), inset 0 0 0 3px rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Img
            src={staticFile('klozet-bubble-pink.png')}
            style={{
              width: 180,
              height: 180,
              objectFit: 'contain',
              filter: 'drop-shadow(0 15px 35px rgba(255, 102, 196, 0.6))',
            }}
          />

          {/* Specular light sweep */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.35) 50%, transparent 60%)',
              transform: `translateX(${sheenProgress}%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Monolithic Typography: "Tu estilo. Tu Klozet." */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeBottom + 40,
          left: THEME.layout.safePaddingX,
          right: THEME.layout.safePaddingX,
          textAlign: 'center',
          zIndex: 50,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
            textShadow: '0 10px 40px rgba(0,0,0,0.95)',
          }}
        >
          Tu estilo. Tu Klozet.
        </h1>
      </div>

      {/* Subtitle / CTA: "klozet.es" */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeBottom - 50,
          left: THEME.layout.safePaddingX,
          right: THEME.layout.safePaddingX,
          textAlign: 'center',
          zIndex: 50,
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: THEME.colors.brandPink,
            margin: 0,
            textShadow: '0 0 25px rgba(255, 102, 196, 0.45)',
          }}
        >
          klozet.es
        </p>
      </div>
    </AbsoluteFill>
  );
};
