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
import { KLOZET_BRAND } from './klozetTokens';

export const Shot1LogoDark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle fade in on frame 0..10
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Standalone wordmark arrival (Apple spring, NO circle around it)
  const logoSpring = spring({
    frame,
    fps,
    config: KLOZET_BRAND.springs.kloeBouncy,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.82, 1]);
  const logoY = interpolate(logoSpring, [0, 1], [28, 0]);
  const microFloat = Math.sin(frame * 0.06) * 4;

  // Monolithic headline entrance (staggered 14 frames after wordmark)
  const textSpring = spring({
    frame: frame - 14,
    fps,
    config: KLOZET_BRAND.springs.appleSnappy,
  });
  const textY = interpolate(textSpring, [0, 1], [32, 0]);
  const textOpacity = interpolate(frame, [14, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: KLOZET_BRAND.colors.nightBg,
        opacity: sceneOpacity,
        fontFamily: KLOZET_BRAND.fonts.sans,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Pure seamless Apple dark studio canvas */}

      {/* Standalone Klozet Official Wordmark — NO circle, NO box */}
      <div
        style={{
          transform: `translateY(${logoY + microFloat - 60}px) scale(${logoScale})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile('landing/klozet-nombre-grande.png')}
          style={{
            width: 560,
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Single Clean Headline: Sentence case, Inter 700, zero pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 340,
          width: '100%',
          textAlign: 'center',
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 20,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 78,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: KLOZET_BRAND.colors.textPrimary,
          }}
        >
          Tu armario.
        </h1>
      </div>
    </AbsoluteFill>
  );
};
