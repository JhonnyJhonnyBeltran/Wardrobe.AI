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

export const Shot6IPhoneCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 15, 185, 200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // iPhone 3D entrance and push-in
  const phoneSpring = spring({
    frame,
    fps,
    config: THEME.springs.heavyDevice,
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1.02]);
  const phoneY = interpolate(phoneSpring, [0, 1], [150, 0]);
  const phoneTiltX = interpolate(frame, [0, 200], [8, 0]);
  const phoneTiltY = interpolate(frame, [0, 200], [-6, 3]);

  // Card docking into the iPhone canvas
  const dockSpring = spring({
    frame: frame - 25,
    fps,
    config: THEME.springs.magneticSnap,
  });
  const cardY = interpolate(dockSpring, [0, 1], [300, 0]);
  const cardScale = interpolate(dockSpring, [0, 1], [0.85, 1]);
  const cardGlow = interpolate(dockSpring, [0, 0.8, 1], [0, 1, 0.35]);

  // Single monolithic text: "En tu móvil. Cada mañana."
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
          background: 'radial-gradient(circle, rgba(255, 102, 196, 0.2) 0%, rgba(20, 20, 30, 0.45) 50%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Glossy dark floor reflection */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          background: 'linear-gradient(to bottom, transparent, rgba(12, 12, 16, 0.96))',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* iPhone 16 Pro Chassis Container */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: `translate(-50%, -50%) perspective(1300px) rotateX(${phoneTiltX}deg) rotateY(${phoneTiltY}deg) translateY(${phoneY}px) scale(${phoneScale})`,
          transformStyle: 'preserve-3d',
          width: 520,
          height: 1040,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer Titanium Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 68,
            backgroundColor: '#1b1b22',
            padding: 12,
            boxShadow:
              '0 45px 100px rgba(0, 0, 0, 0.95), 0 0 50px rgba(255, 102, 196, 0.3), inset 0 0 0 2px rgba(255, 255, 255, 0.18)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Inner OLED Display Glass */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 56,
              backgroundColor: '#09090c',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 140,
                height: 36,
                borderRadius: 20,
                backgroundColor: '#000000',
                zIndex: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 14,
              }}
            >
              {/* Sensor lens reflection */}
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#141724',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
            </div>

            {/* App Header */}
            <div
              style={{
                paddingTop: 68,
                paddingLeft: 26,
                paddingRight: 26,
                paddingBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Img
                  src={staticFile('kloe-avatar.png')}
                  style={{ width: 38, height: 38, objectFit: 'contain' }}
                />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>Kloe</div>
                  <div style={{ fontSize: 13, color: '#8E8E93' }}>Tu estilista</div>
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF66C4' }} />
              </div>
            </div>

            {/* App Canvas Area: Docking Card */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <div
                style={{
                  width: 380,
                  height: 600,
                  borderRadius: 32,
                  overflow: 'hidden',
                  backgroundColor: '#14141a',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  transform: `translateY(${cardY}px) scale(${cardScale})`,
                  boxShadow: `0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 102, 196, ${cardGlow * 0.4})`,
                  position: 'relative',
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
              </div>
            </div>

            {/* Apple Glass Bottom Navigation Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(24, 24, 30, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingLeft: 16,
                paddingRight: 16,
                zIndex: 50,
              }}
            >
              {/* Home */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
              {/* Search */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
              {/* Closet (Active Mascot Icon) */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 102, 196, 0.2)',
                  border: '1px solid rgba(255, 102, 196, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile('klozet-bubble-pink.png')}
                  style={{ width: 26, height: 26, objectFit: 'contain' }}
                />
              </div>
              {/* Profile */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Single Monolithic Text: "En tu móvil. Cada mañana." */}
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
          En tu móvil. Cada mañana.
        </h2>
      </div>
    </AbsoluteFill>
  );
};
