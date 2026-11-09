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

export const Act2KloeChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition
  const sceneOpacity = interpolate(frame, [0, 15, 210, 230], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Mascot Pop Spring
  const mascotSpring = spring({
    frame: frame - 10,
    fps,
    config: THEME.springs.kloeBouncy,
  });
  const mascotScale = interpolate(mascotSpring, [0, 1], [0, 1]);
  const mascotY = interpolate(mascotSpring, [0, 1], [60, 0]);

  // Mascot organic idle float (sine wave)
  const idleY = Math.sin(frame * 0.08) * 8;

  // User Message Spring (comes in from the right)
  const userMsgSpring = spring({
    frame: frame - 40,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const userMsgX = interpolate(userMsgSpring, [0, 1], [80, 0]);
  const userMsgOpacity = interpolate(userMsgSpring, [0, 1], [0, 1]);

  // Thinking dots animation (frame 80 - 120)
  const isThinking = frame >= 80 && frame < 125;
  const dot1 = Math.sin(frame * 0.3) * 6;
  const dot2 = Math.sin((frame + 3) * 0.3) * 6;
  const dot3 = Math.sin((frame + 6) * 0.3) * 6;

  // Kloe Reply Bubble Spring
  const replySpring = spring({
    frame: frame - 125,
    fps,
    config: THEME.springs.appleSnappy,
  });
  const replyY = interpolate(replySpring, [0, 1], [40, 0]);
  const replyScale = interpolate(replySpring, [0, 1], [0.92, 1]);
  const replyOpacity = interpolate(replySpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.black,
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <CinematicBackground accentIntensity={0.22} glowY={42} />

      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          width: '100%',
          textAlign: 'center',
          zIndex: 10,
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
          Tu estilista personal
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
          Solo habla con Kloe.
        </h2>
      </div>

      {/* Center Chat Container */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 820,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          zIndex: 30,
        }}
      >
        {/* Kloe Floating Avatar */}
        <div
          style={{
            transform: `scale(${mascotScale}) translateY(${mascotY + idleY}px)`,
            filter: 'drop-shadow(0 20px 45px rgba(255, 102, 196, 0.55))',
          }}
        >
          <Img
            src={staticFile('kloe-avatar-v2.png')}
            style={{ width: 140, height: 140, objectFit: 'contain' }}
          />
        </div>

        {/* User Message Bubble (Right aligned) */}
        <div
          style={{
            alignSelf: 'flex-end',
            maxWidth: '85%',
            opacity: userMsgOpacity,
            transform: `translateX(${userMsgX}px)`,
            padding: '22px 30px',
            borderRadius: '32px 32px 8px 32px',
            backgroundColor: '#1E1E26',
            border: `1px solid ${THEME.colors.borderGlass}`,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.35,
              fontWeight: 500,
              color: THEME.colors.textPrimary,
            }}
          >
            “Kloe, tengo cena hoy y no sé qué ponerme.”
          </p>
        </div>

        {/* Thinking Indicator */}
        {isThinking && (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 26px',
              borderRadius: 999,
              backgroundColor: 'rgba(30, 30, 38, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${THEME.colors.borderSubtle}`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: THEME.colors.brandPink,
                transform: `translateY(${dot1}px)`,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: THEME.colors.brandPink,
                transform: `translateY(${dot2}px)`,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: THEME.colors.brandPink,
                transform: `translateY(${dot3}px)`,
              }}
            />
            <span
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: 600,
                color: THEME.colors.textSecondary,
              }}
            >
              Kloe está analizando tu armario...
            </span>
          </div>
        )}

        {/* Kloe Reply Bubble (Left aligned) */}
        <div
          style={{
            alignSelf: 'flex-start',
            maxWidth: '92%',
            opacity: replyOpacity,
            transform: `translateY(${replyY}px) scale(${replyScale})`,
            padding: '26px 32px',
            borderRadius: '32px 32px 32px 8px',
            backgroundColor: 'rgba(25, 25, 32, 0.92)',
            backdropFilter: 'blur(35px)',
            border: `1px solid ${THEME.colors.borderPink}`,
            boxShadow:
              '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 102, 196, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: THEME.colors.brandPink,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Kloe AI · Recomendación de Estilo
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 30,
              lineHeight: 1.4,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            “Tranquilo. Tengo la combinación exacta con tu ropa de siempre. Mira esto:”
          </p>

          <div
            style={{
              marginTop: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              borderRadius: 999,
              backgroundColor: 'rgba(255, 102, 196, 0.15)',
              border: `1px solid ${THEME.colors.brandPink}`,
              color: THEME.colors.brandPink,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <span>✦</span>
            <span>Ensamblando outfit personalizado</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
