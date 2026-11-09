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
import { SPRING, TYPE, COLOR } from '../../apple-motion/tokens';

export const Scene2IPhone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Heavy inertia device rise
  const riseSpring = spring({
    frame,
    fps,
    config: { damping: 17, stiffness: 85, mass: 1.1 },
  });
  const translateY = interpolate(riseSpring, [0, 1], [520, 0]);
  const rotateX = interpolate(riseSpring, [0, 1], [26, 4]);
  const scale = interpolate(riseSpring, [0, 1], [0.88, 1]);

  // Title entrance
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: SPRING.textIn,
  });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Kloe avatar entrance inside phone
  const kloeSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 11, stiffness: 120, mass: 0.6 },
  });

  // Fade out transition
  const sceneOpacity = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR.black,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
        overflow: 'hidden',
        fontFamily: TYPE.family,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          textAlign: 'center',
          zIndex: 20,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#FF66C4',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
          }}
        >
          Solución instantánea
        </p>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLOR.white,
            margin: 0,
            letterSpacing: '-0.025em',
          }}
        >
          Klozet. Tu armario en tu iPhone.
        </h2>
      </div>

      {/* 3D Device Container */}
      <div
        style={{
          perspective: 1200,
          position: 'absolute',
          bottom: 20,
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
            {/* Phone Screen UI */}
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#09090b',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 56,
                paddingLeft: 16,
                paddingRight: 16,
                paddingBottom: 16,
              }}
            >
              {/* Screen Top Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Img
                  src={staticFile('klozet-logo-dark.png')}
                  style={{ height: 20, objectFit: 'contain' }}
                />
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 102, 196, 0.15)',
                    color: '#FF66C4',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  34 prendas
                </div>
              </div>

              {/* Kloe AI prompt card inside app */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 18,
                  backgroundColor: '#15151a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                  transform: `scale(${interpolate(kloeSpring, [0, 1], [0.8, 1])})`,
                  opacity: interpolate(kloeSpring, [0, 1], [0, 1]),
                }}
              >
                <Img
                  src={staticFile('kloe-avatar-v2.png')}
                  style={{ width: 36, height: 36, objectFit: 'contain' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF66C4' }}>
                    Kloe AI
                  </div>
                  <div style={{ fontSize: 12, color: COLOR.white, fontWeight: 500 }}>
                    Combinando tu ropa en tiempo real...
                  </div>
                </div>
              </div>

              {/* 2x2 Grid of real wardrobe items inside the phone */}
              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                }}
              >
                {[
                  { img: 'sudadera.png', name: 'Sudadera' },
                  { img: 'pantalon.png', name: 'Pantalón' },
                  { img: 'new balance.png', name: 'New Balance' },
                  { img: 'reloj.png', name: 'Reloj' },
                ].map((item, index) => {
                  const itemSpring = spring({
                    frame: frame - 60 - index * 8,
                    fps,
                    config: SPRING.textIn,
                  });
                  const itemScale = interpolate(itemSpring, [0, 1], [0.7, 1]);
                  const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);

                  return (
                    <div
                      key={item.name}
                      style={{
                        backgroundColor: '#121216',
                        borderRadius: 18,
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10,
                        transform: `scale(${itemScale})`,
                        opacity: itemOpacity,
                      }}
                    >
                      <Img
                        src={staticFile(item.img)}
                        style={{
                          height: 75,
                          width: '100%',
                          objectFit: 'contain',
                        }}
                      />
                      <span
                        style={{
                          marginTop: 6,
                          fontSize: 10,
                          fontWeight: 500,
                          color: COLOR.gray,
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </DeviceMockup>
        </div>
      </div>
    </AbsoluteFill>
  );
};
