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

export const Act5AppleOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for logo
  const logoSpring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // CTA button spring
  const ctaSpring = spring({
    frame: frame - 30,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.9, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Specular light sweep across CTA button
  const sweepX = interpolate(frame, [40, 85], [-300, 480], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <CinematicBackground accentIntensity={0.24} glowY={48} />

      {/* Brand Hub */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 20,
        }}
      >
        <Img
          src={staticFile('klozet-bubble-pink.png')}
          style={{
            width: 150,
            height: 150,
            objectFit: 'contain',
            filter: 'drop-shadow(0 25px 60px rgba(255, 102, 196, 0.65))',
          }}
        />

        <Img
          src={staticFile('klozet-logo-dark.png')}
          style={{
            height: 68,
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Pure Apple CTA (Zero Pills, Elegant Minimal Button) */}
      <div
        style={{
          marginTop: 64,
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          position: 'relative',
          padding: '24px 64px',
          borderRadius: 999,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          boxShadow:
            '0 25px 65px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 102, 196, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          zIndex: 20,
        }}
      >
        {/* Specular shine */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: sweepX,
            width: 80,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
            transform: 'skewX(-25deg)',
            pointerEvents: 'none',
          }}
        />
        <span>Comienza en</span>
        <span style={{ color: '#E11D48', fontWeight: 900 }}>klozet.es</span>
      </div>
    </AbsoluteFill>
  );
};
