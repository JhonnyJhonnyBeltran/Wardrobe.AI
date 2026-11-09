import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SPRING, TYPE, COLOR } from '../../apple-motion/tokens';

export const Scene1Dilema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera push
  const cameraScale = interpolate(frame, [0, 180], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Scene fade out right before scene 2
  const sceneOpacity = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Part 1: "Tu armario está lleno."
  const showPart1 = frame < 85;
  const part1Words = ['Tu', 'armario', 'está', 'lleno.'];

  // Part 2: "Pero no encuentras qué te encaje."
  const part2Words = ['Pero', 'no', 'encuentras', 'qué', 'te', 'encaje.'];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        transform: `scale(${cameraScale})`,
        overflow: 'hidden',
        fontFamily: TYPE.family,
      }}
    >
      {/* Ambient background light */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.12) 0%, transparent 60%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Pill header */}
      <div
        style={{
          padding: '8px 22px',
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#FF66C4',
            boxShadow: '0 0 10px #FF66C4',
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: COLOR.gray,
          }}
        >
          El dilema de cada mañana
        </span>
      </div>

      {/* Typography Container */}
      <div
        style={{
          maxWidth: 1100,
          textAlign: 'center',
          padding: '0 40px',
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {showPart1 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.3em',
            }}
          >
            {part1Words.map((word, i) => {
              const wordSpring = spring({
                frame: frame - i * 6,
                fps,
                config: SPRING.textIn,
              });
              const translateY = interpolate(wordSpring, [0, 1], [35, 0]);
              const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

              return (
                <span
                  key={word}
                  style={{
                    fontSize: 78,
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: COLOR.white,
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    display: 'inline-block',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.28em',
            }}
          >
            {part2Words.map((word, i) => {
              const localFrame = frame - 85;
              const wordSpring = spring({
                frame: localFrame - i * 5,
                fps,
                config: SPRING.textIn,
              });
              const translateY = interpolate(wordSpring, [0, 1], [40, 0]);
              const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
              const isHighlight = word.includes('encaje');

              return (
                <span
                  key={word}
                  style={{
                    fontSize: 76,
                    fontWeight: 700,
                    letterSpacing: '-0.035em',
                    color: isHighlight ? '#FF66C4' : COLOR.white,
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    display: 'inline-block',
                    textShadow: isHighlight
                      ? '0 0 35px rgba(255, 102, 196, 0.45)'
                      : 'none',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtitle anchor */}
      <div
        style={{
          marginTop: 28,
          fontSize: 22,
          color: COLOR.gray,
          fontWeight: 400,
          opacity: interpolate(frame, [100, 125], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Ropa que nunca usas. Combinaciones que no ves.
      </div>
    </AbsoluteFill>
  );
};
