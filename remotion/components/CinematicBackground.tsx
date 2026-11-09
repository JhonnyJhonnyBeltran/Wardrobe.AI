import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME } from '../theme';

interface Props {
  accentIntensity?: number;
  glowY?: number;
}

export const CinematicBackground: React.FC<Props> = ({
  accentIntensity = 0.15,
  glowY = 50,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing sine wave for organic ambient light
  const breath = Math.sin(frame * 0.04) * 0.03;
  const currentIntensity = accentIntensity + breath;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.black, overflow: 'hidden' }}>
      {/* Dynamic ambient radial glow */}
      <div
        style={{
          position: 'absolute',
          top: `${glowY}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 102, 196, ${currentIntensity}) 0%, transparent 68%)`,
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.75) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
