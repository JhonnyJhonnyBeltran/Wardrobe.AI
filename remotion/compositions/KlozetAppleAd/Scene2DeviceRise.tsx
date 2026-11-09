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
import { DeviceMockup } from '../../components/DeviceMockup';
import { BRAND_COLORS, SPRING_PRESETS } from '../../constants';

export const Scene2DeviceRise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for the device
  const riseProgress = spring({
    frame,
    fps,
    config: SPRING_PRESETS.heavyInertia,
  });

  const translateY = interpolate(riseProgress, [0, 1], [500, 0]);
  const rotateX = interpolate(riseProgress, [0, 1], [30, 6]);
  const scale = interpolate(riseProgress, [0, 1], [0.88, 1]);

  // Laser scanner animation
  const scanProgress = interpolate(frame, [30, 120], [-100, 320], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Callout badge spring
  const badgeSpring = spring({
    frame: frame - 45,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const badgeOpacity = interpolate(badgeSpring, [0, 1], [0, 1]);
  const badgeX = interpolate(badgeSpring, [0, 1], [60, 0]);

  // Scene fade out
  const sceneOpacity = interpolate(frame, [170, 190], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_COLORS.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* Top Section Header */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: BRAND_COLORS.pink,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
          }}
        >
          Armario Digital
        </p>
        <h2
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: BRAND_COLORS.textPrimary,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Sube tus prendas. La IA hace el resto.
        </h2>
      </div>

      {/* 3D Perspective Container */}
      <div
        style={{
          perspective: 1200,
          position: 'absolute',
          bottom: 30,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
            transformOrigin: 'center bottom',
          }}
        >
          <DeviceMockup width={360} height={720}>
            {/* Inside Screen Content */}
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#09090b',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 60,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              {/* App Header inside screen */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <Img
                  src={staticFile('klozet-logo-dark.png')}
                  style={{ height: 22, objectFit: 'contain' }}
                />
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 102, 196, 0.15)',
                    color: BRAND_COLORS.pink,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Scanner IA
                </div>
              </div>

              {/* Garment Card being scanned */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 340,
                  borderRadius: 24,
                  backgroundColor: '#141418',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Img
                  src={staticFile('sudadera.png')}
                  style={{
                    width: '80%',
                    height: '80%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))',
                  }}
                />

                {/* Laser scan line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: scanProgress,
                    height: 3,
                    background: `linear-gradient(90deg, transparent 0%, ${BRAND_COLORS.pink} 50%, transparent 100%)`,
                    boxShadow: `0 0 15px ${BRAND_COLORS.pink}, 0 0 30px ${BRAND_COLORS.pink}`,
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    padding: '6px 14px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ color: BRAND_COLORS.pink }}>✓</span> Fondo eliminado en local
                </div>
              </div>

              {/* Categorization chips */}
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {['Sudadera', 'Oversize', 'Negro grafito', 'Algodón'].map(
                  (tag, i) => (
                    <div
                      key={tag}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 14,
                        backgroundColor: '#1a1a20',
                        fontSize: 12,
                        color: BRAND_COLORS.textSecondary,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        opacity: interpolate(
                          frame,
                          [60 + i * 8, 75 + i * 8],
                          [0, 1],
                          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        ),
                      }}
                    >
                      {tag}
                    </div>
                  )
                )}
              </div>
            </div>
          </DeviceMockup>
        </div>

        {/* Floating Feature Callout */}
        <div
          style={{
            position: 'absolute',
            right: '12%',
            top: '40%',
            opacity: badgeOpacity,
            transform: `translateX(${badgeX}px)`,
            padding: '16px 24px',
            borderRadius: 20,
            backgroundColor: 'rgba(20, 20, 25, 0.85)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            maxWidth: 280,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 4,
            }}
          >
            Visión Multimodal
          </div>
          <div
            style={{
              fontSize: 14,
              color: BRAND_COLORS.textSecondary,
              lineHeight: 1.4,
            }}
          >
            Detecta corte, tejido, textura y colorimetría automáticamente con Gemini.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
