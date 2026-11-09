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

export const Shot5CollageCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade transition
  const sceneOpacity = interpolate(frame, [0, 15, 185, 200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera 3D Orbit (Spotify style: smooth track around floating cards)
  const cameraOrbitY = interpolate(frame, [0, 200], [-18, 12]);
  const cameraTiltX = interpolate(frame, [0, 200], [8, 3]);

  // Entrance spring for the cards
  const cardSpring = spring({
    frame,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1]);
  const cardZ = interpolate(cardSpring, [0, 1], [-200, 0]);

  // Card carousel transition (Card 1 transitions to center focus, then Card 2 slides forward)
  const carouselShift = interpolate(frame, [0, 80, 140, 200], [0, 0, -320, -340], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Specular sheen sweep across the glass cards
  const sheenProgress = interpolate(frame, [25, 95], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Monolithic single text: "Outfits de revista con tu ropa."
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
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.18) 0%, rgba(20, 20, 30, 0.45) 50%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy dark floor with specular bounce */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '42%',
          background: 'linear-gradient(to bottom, transparent, rgba(10, 10, 14, 0.98))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Floating Carousel Stage */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          width: 0,
          height: 0,
          transform: `perspective(1400px) rotateY(${cameraOrbitY}deg) rotateX(${cameraTiltX}deg) translateZ(${cardZ}px) scale(${cardScale})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: carouselShift,
            top: 0,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Card 1: Casual Chic */}
          <div
            style={{
              position: 'absolute',
              left: -20,
              top: -380,
              width: 440,
              height: 740,
              transform: 'translate(-50%, 0) rotateY(-8deg)',
              borderRadius: 36,
              overflow: 'hidden',
              backgroundColor: '#16161c',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 40px 90px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 102, 196, 0.25)',
            }}
          >
            <Img
              src={staticFile('ad-assets/collage-casual-chic.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Specular sheen overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%)`,
                transform: `translateX(${sheenProgress}%)`,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Card 2: Quiet Luxury */}
          <div
            style={{
              position: 'absolute',
              left: 480,
              top: -380,
              width: 440,
              height: 740,
              transform: 'translate(-50%, 0) rotateY(12deg)',
              borderRadius: 36,
              overflow: 'hidden',
              backgroundColor: '#16161c',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 40px 90px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 102, 196, 0.25)',
            }}
          >
            <Img
              src={staticFile('ad-assets/collage-quiet-luxury.jpg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Specular sheen overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%)`,
                transform: `translateX(${sheenProgress - 40}%)`,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Single Monolithic Text: "Outfits de revista con tu ropa." */}
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
            textShadow: '0 10px 35px rgba(0,0,0,0.9)',
          }}
        >
          Outfits de revista con tu ropa.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
