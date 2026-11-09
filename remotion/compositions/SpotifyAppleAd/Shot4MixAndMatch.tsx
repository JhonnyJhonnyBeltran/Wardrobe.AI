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
import { THEME } from '../../theme';

export const Shot4MixAndMatch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 15, 185, 200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Kinetic hit entrance of the two key garments
  const enterSpring = spring({
    frame,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const heroScale = interpolate(enterSpring, [0, 1], [0.75, 1]);

  // Bifurcation / split into two branches (Casual Chic vs Quiet Luxury)
  const splitSpring = spring({
    frame: frame - 45,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const splitDistance = interpolate(splitSpring, [0, 1], [0, 250]);
  const splitRotateLeft = interpolate(splitSpring, [0, 1], [0, -6]);
  const splitRotateRight = interpolate(splitSpring, [0, 1], [0, 6]);

  // Monolithic single text: "Dos estilos. Tus mismas prendas."
  const textSpring = spring({
    frame: frame - 20,
    fps,
    config: THEME.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);
  const textOpacity = interpolate(frame, [20, 35, 180, 195], [0, 1, 1, 0], {
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
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 950,
          height: 950,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.18) 0%, rgba(20, 20, 30, 0.4) 45%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy dark floor (Spotify 3D signature) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '42%',
          background: 'linear-gradient(to bottom, transparent, rgba(12, 12, 16, 0.96))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Staging Container */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          width: 0,
          height: 0,
          transform: `perspective(1200px) scale(${heroScale})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Left Branch: Garments aligning for Look 1 (Casual Chic) */}
        <div
          style={{
            position: 'absolute',
            left: -splitDistance,
            top: 0,
            transform: `translate(-50%, -50%) rotateZ(${splitRotateLeft}deg)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 320,
          }}
        >
          {/* Top */}
          <div
            style={{
              width: 220,
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.9))',
              marginBottom: -30,
              zIndex: 2,
            }}
          >
            <Img
              src={staticFile('ad-assets/prenda-top-negro.png')}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          {/* Jeans */}
          <div
            style={{
              width: 260,
              height: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.9))',
              zIndex: 1,
            }}
          >
            <Img
              src={staticFile('ad-assets/prenda-vaquero.png')}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Right Branch: Garments aligning for Look 2 (Quiet Luxury) */}
        {splitDistance > 10 && (
          <div
            style={{
              position: 'absolute',
              left: splitDistance,
              top: 0,
              transform: `translate(-50%, -50%) rotateZ(${splitRotateRight}deg)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 320,
              opacity: interpolate(splitSpring, [0, 0.4, 1], [0, 0.8, 1]),
            }}
          >
            {/* Top */}
            <div
              style={{
                width: 220,
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.9))',
                marginBottom: -30,
                zIndex: 2,
              }}
            >
              <Img
                src={staticFile('ad-assets/prenda-top-negro.png')}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            {/* Jeans */}
            <div
              style={{
                width: 260,
                height: 380,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.9))',
                zIndex: 1,
              }}
            >
              <Img
                src={staticFile('ad-assets/prenda-vaquero.png')}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Single Monolithic Text: "Dos estilos. Tus mismas prendas." */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeBottom,
          left: THEME.layout.safePaddingX,
          right: THEME.layout.safePaddingX,
          textAlign: 'center',
          zIndex: 50,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 70,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: THEME.typography.trackingTight,
            color: THEME.colors.textPrimary,
            margin: 0,
            textShadow: '0 8px 30px rgba(0,0,0,0.9)',
          }}
        >
          Dos estilos. Tus mismas prendas.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
