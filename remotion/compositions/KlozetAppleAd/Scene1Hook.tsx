import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { KineticText } from '../../components/KineticText';
import { BRAND_COLORS, SPRING_PRESETS } from '../../constants';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle camera push-in
  const cameraZoom = interpolate(frame, [0, 120], [1, 1.06], {
    extrapolateRight: 'clamp',
  });

  // Fade out towards scene end
  const sceneOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });

  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeSpring, [0, 1], [-20, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        transform: `scale(${cameraZoom})`,
        overflow: 'hidden',
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_COLORS.pinkGlow} 0%, transparent 65%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Pill Badge */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `translateY(${badgeY}px)`,
          padding: '8px 20px',
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: BRAND_COLORS.pink,
            boxShadow: `0 0 12px ${BRAND_COLORS.pink}`,
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: BRAND_COLORS.textSecondary,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}
        >
          Presentando Klozet
        </span>
      </div>

      {/* Kinetic Headline */}
      <div style={{ maxWidth: 900, textAlign: 'center', padding: '0 24px' }}>
        <KineticText
          text="Tu armario entero. Reinventado con IA."
          delay={15}
          fontSize={72}
          highlightWords={['IA.', 'Reinventado']}
          highlightColor={BRAND_COLORS.pink}
        />
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 22,
          color: BRAND_COLORS.textSecondary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          fontWeight: 400,
          opacity: interpolate(frame, [45, 65], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Digitaliza tus prendas. Genera outfits al instante.
      </p>
    </AbsoluteFill>
  );
};
