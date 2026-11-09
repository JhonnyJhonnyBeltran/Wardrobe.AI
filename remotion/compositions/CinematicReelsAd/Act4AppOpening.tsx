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
  const sceneOpacity = interpolate(frame, [0, 15, 215, 230], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Device rise and settle
  const deviceSpring = spring({
    frame,
    fps,
    config: THEME.springs.heavyDevice,
  });
  const deviceY = interpolate(deviceSpring, [0, 1], [600, 0]);
  const deviceScale = interpolate(deviceSpring, [0, 1], [0.85, 1]);

  // Tap on Klozet Icon (Frames 35 - 55)
  const tapScale = interpolate(frame, [38, 45, 52], [1, 0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapRingOpacity = interpolate(frame, [42, 58], [0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tapRingScale = interpolate(frame, [42, 58], [1, 2.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // iOS App Opening Zoom (Frames 50 - 90)
  const appOpenSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.9 },
  });
  const homeScreenOpacity = interpolate(appOpenSpring, [0, 0.6], [1, 0]);
  const appScreenOpacity = interpolate(appOpenSpring, [0.3, 1], [0, 1]);
  const appScale = interpolate(appOpenSpring, [0, 1], [0.4, 1]);

  // Section title
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

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

      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          width: '100%',
          textAlign: 'center',
          zIndex: 30,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: THEME.colors.brandPink,
            letterSpacing: THEME.typography.trackingBadge,
            textTransform: 'uppercase',
            margin: '0 0 10px 0',
          }}
        >
          Experiencia Nativa
        </p>
        <h2
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: THEME.colors.textPrimary,
            letterSpacing: THEME.typography.trackingHeadline,
            margin: 0,
          }}
        >
          Tu armario entero en tu mano.
        </h2>
      </div>

      {/* iPhone 16 Pro Vertical Centerpiece */}
      <div
        style={{
          position: 'absolute',
          top: '56%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${deviceY}px) scale(${deviceScale})`,
          width: 580,
          height: 1180,
          borderRadius: 68,
          padding: 14,
          background:
            'linear-gradient(150deg, #44444a 0%, #1e1e22 50%, #34343a 100%)',
          boxShadow:
            '0 60px 140px rgba(0, 0, 0, 0.95), 0 0 0 2px rgba(255, 255, 255, 0.14) inset, 0 0 60px rgba(255, 102, 196, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
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
            borderRadius: 56,
            backgroundColor: '#09090b',
            overflow: 'hidden',
          }}
        >
          {/* Layer A: iOS Home Screen (Before App Opens) */}
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
              paddingTop: 120,
              paddingLeft: 30,
              paddingRight: 30,
              pointerEvents: homeScreenOpacity <= 0 ? 'none' : 'auto',
            }}
          >
            {/* Clock & Date Widget */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
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
                  fontSize: 84,
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
                gap: 24,
                width: '100%',
              }}
            >
              {/* Other dummy iOS icons */}
              {['Fotos', 'Cámara', 'Mapas'].map((name) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    opacity: 0.6,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 18,
                      backgroundColor: '#252530',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#aaa' }}>{name}</span>
                </div>
              ))}

              {/* The Hero Klozet Icon with Tap Feedback */}
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
                {/* Tap Ripple Ring */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    border: `2px solid ${THEME.colors.brandPink}`,
                    opacity: tapRingOpacity,
                    transform: `scale(${tapRingScale})`,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    backgroundColor: '#121216',
                    border: `1.5px solid ${THEME.colors.brandPink}`,
                    boxShadow: '0 10px 25px rgba(255, 102, 196, 0.4)',
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
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  Klozet
                </span>
              </div>
            </div>
          </div>

          {/* Layer B: Real Klozet App Interface (After Opening) */}
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
              paddingTop: 85,
              paddingLeft: 22,
              paddingRight: 22,
              paddingBottom: 20,
            }}
          >
            {/* App Nav Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Img
                src={staticFile('klozet-logo-dark.png')}
                style={{ height: 24, objectFit: 'contain' }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(255, 102, 196, 0.15)',
                  color: THEME.colors.brandPink,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <span>✦</span>
                <span>Look Listo</span>
              </div>
            </div>

            {/* Main App Content: Outfit Canvas */}
            <div
              style={{
                flex: 1,
                marginTop: 18,
                backgroundColor: '#121217',
                borderRadius: 28,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 16,
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
                Lienzo Inteligente · Cena Casual
              </div>

              {/* Outfit stacked inside the mobile app */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile('sudadera.png')}
                  style={{ height: 160, objectFit: 'contain' }}
                />
                <Img
                  src={staticFile('pantalon.png')}
                  style={{ height: 180, objectFit: 'contain', marginTop: -20 }}
                />
                <Img
                  src={staticFile('new balance.png')}
                  style={{ height: 95, objectFit: 'contain', marginTop: -15 }}
                />
              </div>

              {/* Action Button inside app */}
              <div
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 18,
                  backgroundColor: THEME.colors.brandPink,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: 'center',
                  boxShadow: '0 8px 25px rgba(255, 102, 196, 0.4)',
                }}
              >
                Guardar en Calendario de Outfits
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
