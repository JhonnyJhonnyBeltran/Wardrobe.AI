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

export const Act2KloeChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 12, 210, 225], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Mascot Pop Spring
  const mascotSpring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.kloeBouncy,
  });
  const mascotScale = interpolate(mascotSpring, [0, 1], [0, 1]);
  const mascotY = interpolate(mascotSpring, [0, 1], [80, 0]);
  const idleY = Math.sin(frame * 0.08) * 8;

  // Single Text 1 (Frames 20 - 105): "Kloe, no sé qué ponerme hoy."
  const showText1 = frame >= 20 && frame < 110;
  const text1Spring = spring({
    frame: frame - 25,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const text1Y = interpolate(text1Spring, [0, 1], [35, 0]);
  const text1Opacity = interpolate(frame, [20, 32, 98, 110], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Single Text 2 (Frames 115 - 220): "Tengo tu look. En 3 segundos."
  const showText2 = frame >= 110;
  const text2Spring = spring({
    frame: frame - 118,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const text2Y = interpolate(text2Spring, [0, 1], [35, 0]);
  const text2Opacity = interpolate(frame, [110, 124, 205, 220], [0, 1, 1, 0], {
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
      <CinematicBackground accentIntensity={0.22} glowY={44} />

      {/* Central Area: Kloe Mascot + Monolithic Dialogue */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '88%',
          maxWidth: 920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          zIndex: 30,
        }}
      >
        {/* Kloe Floating Bubble Avatar */}
        <div
          style={{
            transform: `scale(${mascotScale}) translateY(${mascotY + idleY}px)`,
            filter: 'drop-shadow(0 25px 55px rgba(255, 102, 196, 0.6))',
          }}
        >
          <Img
            src={staticFile('kloe-avatar-v2.png')}
            style={{ width: 180, height: 180, objectFit: 'contain' }}
          />
        </div>

        {/* Text 1: The User's Dilemma */}
        {showText1 && (
          <div
            style={{
              textAlign: 'center',
              opacity: text1Opacity,
              transform: `translateY(${text1Y}px)`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 64,
                lineHeight: 1.15,
                fontWeight: 700,
                color: THEME.colors.textPrimary,
                letterSpacing: THEME.typography.trackingTight,
              }}
            >
              “Kloe, no sé qué ponerme hoy.”
            </p>
          </div>
        )}

        {/* Text 2: Kloe's Instant Solution */}
        {showText2 && (
          <div
            style={{
              textAlign: 'center',
              opacity: text2Opacity,
              transform: `translateY(${text2Y}px)`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 68,
                lineHeight: 1.12,
                fontWeight: 800,
                color: THEME.colors.brandPink,
                letterSpacing: THEME.typography.trackingTight,
                textShadow: '0 0 50px rgba(255, 102, 196, 0.5)',
              }}
            >
              “Tengo tu look.<br />En 3 segundos.”
            </p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
