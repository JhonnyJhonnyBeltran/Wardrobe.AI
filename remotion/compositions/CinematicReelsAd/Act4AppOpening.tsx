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

export const Act4AppOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 12, 205, 220], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Device rise
  const deviceSpring = spring({
    frame,
    fps,
    config: THEME.springs.heavyDevice,
  });
  const deviceY = interpolate(deviceSpring, [0, 1], [500, 0]);
  const deviceScale = interpolate(deviceSpring, [0, 1], [0.88, 1]);

  // Tap on Klozet Icon (Frames 28 - 48)
  const tapScale = interpolate(frame, [30, 38, 46], [1, 0.88, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapRingOpacity = interpolate(frame, [34, 48], [0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapRingScale = interpolate(frame, [34, 48], [1, 2.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // iOS App Opening Zoom (Frames 45 - 85)
  const appOpenSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 17, stiffness: 95, mass: 0.9 },
  });
  const homeScreenOpacity = interpolate(appOpenSpring, [0, 0.5], [1, 0]);
  const appScreenOpacity = interpolate(appOpenSpring, [0.3, 1], [0, 1]);
  const appScale = interpolate(appOpenSpring, [0, 1], [0.35, 1]);

  // Single Headline (Frames 15 - 210): "En tu móvil."
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(frame, [15, 26, 200, 215], [0, 1, 1, 0], {
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
      <CinematicBackground accentIntensity={0.2} glowY={55} />

      {/* SINGLE HEADLINE (Zero Pills, Pure Apple) */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          width: '100%',
          textAlign: 'center',
          zIndex: 40,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: THEME.colors.textPrimary,
            letterSpacing: THEME.typography.trackingTight,
            margin: 0,
          }}
        >
          En tu móvil.
        </h1>
      </div>

      {/* iPhone 16 Pro Vertical Mockup */}
      <div
        style={{
          position: 'absolute',
          top: '58%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${deviceY}px) scale(${deviceScale})`,
          width: 600,
          height: 1220,
          borderRadius: 72,
          padding: 14,
          background:
            'linear-gradient(150deg, #44444a 0%, #1e1e22 50%, #34343a 100%)',
          boxShadow:
            '0 70px 150px rgba(0, 0, 0, 0.95), 0 0 0 2px rgba(255, 255, 255, 0.14) inset, 0 0 60px rgba(255, 102, 196, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 145,
            height: 38,
            backgroundColor: '#000000',
            borderRadius: 20,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            boxShadow: '0 0 2px rgba(255,255,255,0.2)',
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: '#0d1322',
              border: '1px solid #1a2238',
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#080808',
            }}
          />
        </div>

        {/* Screen Frame */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 58,
            backgroundColor: '#09090b',
            overflow: 'hidden',
          }}
        >
          {/* Layer A: iOS Home Screen */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: homeScreenOpacity,
              background:
                'radial-gradient(circle at 50% 30%, #1a1a2e 0%, #0d0d14 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 130,
              paddingLeft: 36,
              paddingRight: 36,
              pointerEvents: homeScreenOpacity <= 0 ? 'none' : 'auto',
            }}
          >
            {/* Clock & Date */}
            <div style={{ textAlign: 'center', marginBottom: 70 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Viernes, 21 de Noviembre
              </div>
              <div
                style={{
                  fontSize: 88,
                  fontWeight: 300,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  marginTop: -5,
                }}
              >
                20:45
              </div>
            </div>

            {/* App Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 26,
                width: '100%',
              }}
            >
              {['Fotos', 'Cámara', 'Mapas'].map((name) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    opacity: 0.5,
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 20,
                      backgroundColor: '#252530',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#aaa' }}>{name}</span>
                </div>
              ))}

              {/* The Klozet App Icon */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transform: `scale(${tapScale})`,
                }}
              >
                {/* Haptic Tap Ring */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    border: `2px solid ${THEME.colors.brandPink}`,
                    opacity: tapRingOpacity,
                    transform: `scale(${tapRingScale})`,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 22,
                    backgroundColor: '#121216',
                    border: `1.5px solid ${THEME.colors.brandPink}`,
                    boxShadow: '0 12px 30px rgba(255, 102, 196, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Img
                    src={staticFile('klozet-bubble-pink.png')}
                    style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  Klozet
                </span>
              </div>
            </div>
          </div>

          {/* Layer B: Klozet Native App Interface (App Opened) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: appScreenOpacity,
              transform: `scale(${appScale})`,
              transformOrigin: '75% 35%',
              backgroundColor: '#09090b',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 90,
              paddingLeft: 24,
              paddingRight: 24,
              paddingBottom: 24,
            }}
          >
            {/* App Nav Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 18,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Img
                src={staticFile('klozet-logo-dark.png')}
                style={{ height: 26, objectFit: 'contain' }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: THEME.colors.brandPink }}>
                Outfit Activo
              </span>
            </div>

            {/* Main App Content: Real Outfit inside Mobile */}
            <div
              style={{
                flex: 1,
                marginTop: 20,
                backgroundColor: '#131318',
                borderRadius: 32,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: THEME.colors.textSecondary,
                  alignSelf: 'flex-start',
                }}
              >
                Cena de Hoy
              </div>

              {/* Realistic Outfit stack inside the phone */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile('sudadera.png')}
                  style={{ height: 165, objectFit: 'contain', zIndex: 2 }}
                />
                <Img
                  src={staticFile('pantalon.png')}
                  style={{ height: 190, objectFit: 'contain', marginTop: -25, zIndex: 1 }}
                />
                <Img
                  src={staticFile('new balance.png')}
                  style={{ height: 105, objectFit: 'contain', marginTop: -20, zIndex: 3 }}
                />
              </div>

              {/* Bottom CTA button in app */}
              <div
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 20,
                  backgroundColor: THEME.colors.brandPink,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(255, 102, 196, 0.4)',
                }}
              >
                Guardar en Calendario
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
