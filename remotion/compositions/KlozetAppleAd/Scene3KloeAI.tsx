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

export const Scene3KloeAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for phone
  const phoneSpring = spring({
    frame,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.92, 1]);
  const phoneRotateY = interpolate(phoneSpring, [0, 1], [15, -8]);

  // Mascot spring pop
  const mascotSpring = spring({
    frame: frame - 20,
    fps,
    config: SPRING_PRESETS.kloeBouncy,
  });
  const mascotScale = interpolate(mascotSpring, [0, 1], [0, 1]);
  const mascotY = interpolate(mascotSpring, [0, 1], [80, 0]);

  // Speech bubble spring
  const bubbleSpring = spring({
    frame: frame - 40,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const bubbleOpacity = interpolate(bubbleSpring, [0, 1], [0, 1]);
  const bubbleScale = interpolate(bubbleSpring, [0, 1], [0.8, 1]);

  // Snapping items spring inside screen
  const snapTop = spring({
    frame: frame - 50,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const snapBottom = spring({
    frame: frame - 65,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });
  const snapShoes = spring({
    frame: frame - 80,
    fps,
    config: SPRING_PRESETS.appleSnappy,
  });

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
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          right: '25%',
          top: '30%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND_COLORS.pinkGlow} 0%, transparent 70%)`,
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Headline */}
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
          Asesora Inteligente
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
          Pídele a Kloe. Outfits completos en 3 segundos.
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
          marginTop: 60,
          perspective: 1200,
        }}
      >
        {/* Phone Mockup with Interactive Canvas */}
        <div
          style={{
            transform: `scale(${phoneScale}) rotateY(${phoneRotateY}deg) rotateX(4deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <DeviceMockup width={340} height={680}>
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#09090b',
                display: 'flex',
                flexDirection: 'column',
                padding: '60px 16px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: BRAND_COLORS.textSecondary,
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                Lienzo de Outfit · Cena Casual
              </div>

              {/* 3 Canvas Layers Snapping */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  backgroundColor: '#121216',
                  borderRadius: 24,
                  padding: 12,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Top: Sudadera */}
                <div
                  style={{
                    height: '32%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(snapTop, [0, 1], [0.6, 1])})`,
                    opacity: interpolate(snapTop, [0, 1], [0, 1]),
                  }}
                >
                  <Img
                    src={staticFile('sudadera.png')}
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Bottom: Pantalón */}
                <div
                  style={{
                    height: '34%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(snapBottom, [0, 1], [0.6, 1])})`,
                    opacity: interpolate(snapBottom, [0, 1], [0, 1]),
                  }}
                >
                  <Img
                    src={staticFile('pantalon.png')}
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Shoes: New Balance */}
                <div
                  style={{
                    height: '24%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${interpolate(snapShoes, [0, 1], [0.6, 1])})`,
                    opacity: interpolate(snapShoes, [0, 1], [0, 1]),
                  }}
                >
                  <Img
                    src={staticFile('new balance.png')}
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          </DeviceMockup>
        </div>

        {/* Kloe AI Character & Speech Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            maxWidth: 380,
          }}
        >
          {/* Mascot Avatar Pop */}
          <div
            style={{
              transform: `scale(${mascotScale}) translateY(${mascotY}px)`,
              marginBottom: 16,
            }}
          >
            <Img
              src={staticFile('kloe-avatar-v2.png')}
              style={{
                width: 100,
                height: 100,
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 30px rgba(255, 102, 196, 0.4))',
              }}
            />
          </div>

          {/* Speech Bubble */}
          <div
            style={{
              opacity: bubbleOpacity,
              transform: `scale(${bubbleScale})`,
              transformOrigin: 'top left',
              padding: '20px 24px',
              borderRadius: 24,
              backgroundColor: 'rgba(25, 25, 30, 0.9)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 102, 196, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: BRAND_COLORS.pink,
                marginBottom: 6,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Kloe · Tu Estilista
            </div>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.45,
                color: '#FFFFFF',
                margin: 0,
                fontWeight: 500,
              }}
            >
              “Para tu cena de hoy combiné tu sudadera con el pantalón carpintero y zapatillas neutras. Equilibrio perfecto de proporciones.”
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
