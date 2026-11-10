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

export const Shot7OutroLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle fade out at tail (155..180)
  const sceneOpacity = interpolate(frame, [0, 8, 155, 180], [0.9, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Standalone Logos Entrance (NO circles around either logo!)
  const klozetSpring = spring({
    frame,
    fps,
    config: KLOZET_BRAND.springs.kloeBouncy,
  });
  const kloeSpring = spring({
    frame: frame - 8,
    fps,
    config: KLOZET_BRAND.springs.kloeBouncy,
  });

  const klozetScale = interpolate(klozetSpring, [0, 1], [0.76, 1]);
  const kloeScale = interpolate(kloeSpring, [0, 1], [0.76, 1]);
  const kloeFloat = Math.sin(frame * 0.06) * 4;

  // Claim entrance
  const textSpring = spring({
    frame: frame - 18,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [32, 0]);
  const textOpacity = interpolate(frame, [16, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // URL CTA entrance
  const urlSpring = spring({
    frame: frame - 32,
    fps,
    config: KLOZET_BRAND.springs.appleSnappy,
  });
  const urlY = interpolate(urlSpring, [0, 1], [24, 0]);
  const urlOpacity = interpolate(frame, [30, 44], [0, 1], {
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

      {/* Standalone Klozet & Kloe Wordmarks Lockup — ZERO circles, NO coins */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 44,
          transform: 'translateY(-110px)',
          zIndex: 20,
        }}
      >
        {/* Official Klozet Wordmark */}
        <div
          style={{
            transform: `scale(${klozetScale})`,
            opacity: klozetSpring,
          }}
        >
          <Img
            src={staticFile('landing/klozet-nombre-grande.png')}
            style={{
              width: 520,
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Hairline divider + Official Pink Kloe Wordmark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            transform: `translateY(${kloeFloat}px) scale(${kloeScale})`,
            opacity: kloeSpring,
          }}
        >
          <div
            style={{
              width: 96,
              height: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
            }}
          />
          <Img
            src={staticFile('kloe-logo-large.png')}
            style={{
              width: 220,
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* Single Clean Claim */}
      <div
        style={{
          position: 'absolute',
          bottom: 390,
          left: 64,
          right: 64,
          textAlign: 'center',
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 30,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 66,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: KLOZET_BRAND.colors.textPrimary,
          }}
        >
          Tu estilo, en tu móvil.
        </h2>
      </div>

      {/* Brand Pink Domain Link */}
      <div
        style={{
          position: 'absolute',
          bottom: 305,
          left: 64,
          right: 64,
          textAlign: 'center',
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          zIndex: 30,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: KLOZET_BRAND.colors.pink,
          }}
        >
          klozet.es
        </p>
      </div>
    </AbsoluteFill>
  );
};
