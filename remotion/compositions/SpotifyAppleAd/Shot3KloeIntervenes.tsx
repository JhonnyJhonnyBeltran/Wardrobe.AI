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

const FROZEN_GARMENTS = [
  { src: 'ad-assets/real/zara-jersey-crema.png', x: -310, y: -230, w: 230, h: 260, rot: -10 },
  { src: 'ad-assets/real/jeans-recto-azul.png', x: 310, y: -150, w: 190, h: 420, rot: 12 },
  { src: 'ad-assets/real/adidas-gazelle-marron.png', x: -290, y: 240, w: 260, h: 160, rot: -15 },
  { src: 'ad-assets/real/zuecos-tachuelas.png', x: 290, y: 260, w: 210, h: 240, rot: 14 },
  { src: 'ad-assets/real/gafas-blancas.png', x: -160, y: -400, w: 210, h: 120, rot: 8 },
  { src: 'ad-assets/real/pendientes-aros-oro.png', x: 200, y: -390, w: 170, h: 170, rot: -12 },
];

export const Shot3KloeIntervenes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Garments smoothly settle & dim into depth
  const freezeSpring = spring({
    frame,
    fps,
    config: KLOZET_BRAND.springs.appleSnappy,
  });
  const bgOpacity = interpolate(freezeSpring, [0, 1], [0.75, 0.25]);
  const bgScale = interpolate(freezeSpring, [0, 1], [1.05, 0.92]);

  // Tension compression right before Beat 11 drop (frames 96..120 = 0.4s vacuum drop)
  const dropCompression = interpolate(frame, [94, 118, 120], [1, 0.94, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Standalone Kloe avatar + wordmark — NO circle container
  const kloeSpring = spring({
    frame: frame - 6,
    fps,
    config: KLOZET_BRAND.springs.kloeBouncy,
  });
  const kloeScale = interpolate(kloeSpring, [0, 1], [0.5, 1]) * dropCompression;
  const kloeY = interpolate(kloeSpring, [0, 1], [-120, 0]);
  const hoverY = Math.sin(frame * 0.08) * 6;

  // Monolithic single text: "Pregúntale a Kloe."
  const textSpring = spring({
    frame: frame - 18,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [36, 0]);
  const textOpacity = interpolate(frame, [18, 28, 108, 120], [0, 1, 1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: KLOZET_BRAND.colors.nightBg,
        overflow: 'hidden',
        fontFamily: KLOZET_BRAND.fonts.sans,
      }}
    >
      {/* Frozen Garments Suspended in Depth */}
      <div
        style={{
          position: 'absolute',
          top: '44%',
          left: '50%',
          width: 0,
          height: 0,
          transform: `scale(${bgScale})`,
          opacity: bgOpacity,
        }}
      >
        {FROZEN_GARMENTS.map((g, i) => {
          const floatOffset = Math.sin(frame * 0.04 + i) * 6;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: g.x - g.w / 2,
                top: g.y - g.h / 2 + floatOffset,
                width: g.w,
                height: g.h,
                transform: `rotate(${g.rot}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Img
                src={staticFile(g.src)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Standalone Kloe Hero Logo & Character — Strictly WITHOUT any circle */}
      <div
        style={{
          position: 'absolute',
          top: '39%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${kloeY + hoverY}px) scale(${kloeScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          zIndex: 40,
        }}
      >
        <Img
          src={staticFile('kloe-avatar-v2.png')}
          style={{
            width: 240,
            height: 240,
            objectFit: 'contain',
          }}
        />
        <Img
          src={staticFile('kloe-logo-large.png')}
          style={{
            width: 260,
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Single Headline Block */}
      <div
        style={{
          position: 'absolute',
          bottom: 240,
          left: 64,
          right: 64,
          textAlign: 'center',
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 50,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 70,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: KLOZET_BRAND.colors.textPrimary,
          }}
        >
          Pregúntale a Kloe.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
