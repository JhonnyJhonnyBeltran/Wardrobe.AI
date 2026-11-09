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
import { BRAND_COLORS, SPRING_PRESETS } from '../../constants';

export const Scene4Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  const ctaSpring = spring({
    frame: frame - 25,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.9, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Specular light sweep across CTA
  const sweepX = interpolate(frame, [35, 80], [-200, 350], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_COLORS.pinkGlow} 0%, transparent 65%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand Logo & Name */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <Img
          src={staticFile('klozet-bubble-pink.png')}
          style={{
            width: 90,
            height: 90,
            objectFit: 'contain',
            filter: 'drop-shadow(0 15px 35px rgba(255, 102, 196, 0.45))',
          }}
        />

        <Img
          src={staticFile('klozet-logo-dark.png')}
          style={{
            height: 48,
            objectFit: 'contain',
          }}
        />

        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: BRAND_COLORS.textSecondary,
            margin: '8px 0 0 0',
            letterSpacing: '-0.02em',
          }}
        >
          El armario inteligente que viste tu día.
        </p>
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 48,
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          position: 'relative',
          padding: '16px 36px',
          borderRadius: 999,
          backgroundColor: '#FFFFFF',
          color: '#000000',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 102, 196, 0.25)',
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
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            transform: 'skewX(-25deg)',
            pointerEvents: 'none',
          }}
        />
        <span>Pruébalo gratis en</span>
        <span style={{ color: '#E11D48', fontWeight: 800 }}>klozet.es</span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 13,
          color: '#55555a',
          letterSpacing: '0.05em',
        }}
      >
        Disponible en Web, iOS y Android PWA
      </div>
    </AbsoluteFill>
  );
};
