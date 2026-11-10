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

interface VortexPiece {
  src: string;
  x: number;
  y: number;
  zStart: number;
  zEnd: number;
  rotStart: number;
  rotEnd: number;
  width: number;
  height: number;
  delay: number;
}

const REAL_PIECES: VortexPiece[] = [
  {
    src: 'ad-assets/real/zara-jersey-crema.png',
    x: -230,
    y: -250,
    zStart: -320,
    zEnd: 70,
    rotStart: -16,
    rotEnd: 8,
    width: 300,
    height: 340,
    delay: 0,
  },
  {
    src: 'ad-assets/real/jeans-recto-azul.png',
    x: 245,
    y: -140,
    zStart: -260,
    zEnd: 40,
    rotStart: 18,
    rotEnd: -9,
    width: 240,
    height: 520,
    delay: 4,
  },
  {
    src: 'ad-assets/real/adidas-gazelle-marron.png',
    x: -245,
    y: 170,
    zStart: -200,
    zEnd: 110,
    rotStart: -24,
    rotEnd: 11,
    width: 320,
    height: 200,
    delay: 8,
  },
  {
    src: 'ad-assets/real/zuecos-tachuelas.png',
    x: 235,
    y: 230,
    zStart: -300,
    zEnd: 95,
    rotStart: 22,
    rotEnd: -12,
    width: 250,
    height: 280,
    delay: 10,
  },
  {
    src: 'ad-assets/real/gafas-blancas.png',
    x: 20,
    y: -360,
    zStart: -180,
    zEnd: 160,
    rotStart: -12,
    rotEnd: 6,
    width: 260,
    height: 150,
    delay: 14,
  },
  {
    src: 'ad-assets/real/pendientes-aros-oro.png',
    x: -40,
    y: -20,
    zStart: -140,
    zEnd: 190,
    rotStart: 28,
    rotEnd: -14,
    width: 210,
    height: 210,
    delay: 18,
  },
  {
    src: 'ad-assets/real/camiseta-blanca-larga.png',
    x: 245,
    y: -380,
    zStart: -350,
    zEnd: 20,
    rotStart: -14,
    rotEnd: 7,
    width: 260,
    height: 260,
    delay: 12,
  },
  {
    src: 'ad-assets/real/bolso-ante-beige.png',
    x: -10,
    y: 125,
    zStart: -240,
    zEnd: 130,
    rotStart: 15,
    rotEnd: -8,
    width: 210,
    height: 240,
    delay: 16,
  },
];

export const Shot2DilemaVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = Math.min(1, frame / 120);
  const cameraRotateY = interpolate(frame, [0, 120], [-10, 12]);
  const cameraRotateX = interpolate(frame, [0, 120], [8, -4]);

  // Monolithic single headline
  const textSpring = spring({
    frame: frame - 8,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [36, 0]);
  const textOpacity = interpolate(frame, [8, 18], [0, 1], {
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
      {/* Subtle glossy studio horizon */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          background: 'linear-gradient(to bottom, rgba(24,24,27,0.35), rgba(0,0,0,0.92))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Orbiting Garments Stage */}
      <div
        style={{
          position: 'absolute',
          top: '43%',
          left: '50%',
          width: 0,
          height: 0,
          transform: `perspective(1200px) rotateY(${cameraRotateY}deg) rotateX(${cameraRotateX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {REAL_PIECES.map((piece, idx) => {
          const itemSpring = spring({
            frame: Math.max(0, frame - piece.delay),
            fps,
            config: KLOZET_BRAND.springs.appleSnappy,
          });
          const swirlAngle = progress * Math.PI * 0.9 + idx * 0.8;
          const orbitX = piece.x + Math.cos(swirlAngle) * 70;
          const orbitY = piece.y + Math.sin(swirlAngle) * 52;
          const curZ = interpolate(progress, [0, 1], [piece.zStart, piece.zEnd]);
          const curRot = interpolate(progress, [0, 1], [piece.rotStart, piece.rotEnd]);
          const itemScale = interpolate(itemSpring, [0, 1], [0.45, 1]);

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: orbitX - piece.width / 2,
                top: orbitY - piece.height / 2,
                width: piece.width,
                height: piece.height,
                transform: `translateZ(${curZ}px) rotateZ(${curRot}deg) scale(${itemScale})`,
                opacity: itemSpring,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 28px 34px rgba(0, 0, 0, 0.85))',
              }}
            >
              <Img
                src={staticFile(piece.src)}
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

      {/* Clean legibility scrim behind text only */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 460,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 35%, transparent)',
          pointerEvents: 'none',
          zIndex: 35,
        }}
      />

      {/* Single Headline Block */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
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
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: KLOZET_BRAND.colors.textPrimary,
          }}
        >
          Muchas prendas.
          <br />
          ¿Qué te pones hoy?
        </h2>
      </div>
    </AbsoluteFill>
  );
};
