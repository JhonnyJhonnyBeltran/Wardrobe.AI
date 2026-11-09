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

export const Scene4FinalOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for logo
  const logoSpring = spring({
    frame,
    fps,
    config: SPRING.textIn,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // CTA button spring
  const ctaSpring = spring({
    frame: frame - 20,
    fps,
    config: SPRING.textIn,
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.88, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Specular light sweep across CTA
  const sweepX = interpolate(frame, [30, 75], [-200, 360], {
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
        overflow: 'hidden',
        fontFamily: TYPE.family,
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 850,
          height: 850,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.22) 0%, transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand Logo & Wordmark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <Img
          src={staticFile('klozet-bubble-pink.png')}
          style={{
            width: 96,
            height: 96,
            objectFit: 'contain',
            filter: 'drop-shadow(0 15px 40px rgba(255, 102, 196, 0.5))',
          }}
        />

        <Img
          src={staticFile('klozet-logo-dark.png')}
          style={{
            height: 52,
            objectFit: 'contain',
          }}
        />

        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: COLOR.gray,
            margin: '6px 0 0 0',
            letterSpacing: '-0.02em',
          }}
        >
          Tu armario entero. Resuelto con IA.
        </p>
      </div>

      {/* Apple-style CTA pill button */}
      <div
        style={{
          marginTop: 44,
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          position: 'relative',
          padding: '16px 40px',
          borderRadius: 999,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 102, 196, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Specular shine */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: sweepX,
            width: 60,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
            transform: 'skewX(-25deg)',
            pointerEvents: 'none',
          }}
        />
        <span>Comienza gratis en</span>
        <span style={{ color: '#E11D48', fontWeight: 800 }}>klozet.es</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 36,
          fontSize: 13,
          color: '#55555c',
          letterSpacing: '0.04em',
        }}
      >
        Disponible en Web, iOS y Android PWA
      </div>
    </AbsoluteFill>
  );
};
