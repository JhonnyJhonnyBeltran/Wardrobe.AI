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
import {
  Heart,
  MessageCircle,
  Share,
  Link2,
  Bookmark,
  MoreVertical,
  X,
} from 'lucide-react';
import { KLOZET_BRAND } from './klozetTokens';
import { IPhoneShell } from './IPhoneShell';

const POST_GARMENTS = [
  {
    src: 'ad-assets/real/camiseta-blanca-larga.png',
    brand: 'COS',
    name: 'Camiseta manga larga',
  },
  {
    src: 'ad-assets/real/jeans-recto-azul.png',
    brand: 'Zara',
    name: 'Vaquero wide fit',
  },
  {
    src: 'ad-assets/real/zuecos-tachuelas.png',
    brand: 'Birkenstock',
    name: 'Boston tachuelas',
  },
  {
    src: 'ad-assets/real/bolso-ante-beige.png',
    brand: 'Zara',
    name: 'Bolso ante cadena',
  },
];

export const Shot6PostFeedScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle Apple 3D camera pan/tilt across the iPhone
  const yaw = interpolate(frame, [0, 210], [-3, 2.5]);
  const scale = interpolate(frame, [0, 30, 210], [1.03, 1, 1.01]);

  // Double-tap heart burst around frame 65..95
  const heartBurstSpring = spring({
    frame: Math.max(0, frame - 68),
    fps,
    config: KLOZET_BRAND.springs.kloeBouncy,
  });
  const heartBurstOpacity = interpolate(frame, [68, 76, 94, 108], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const isLiked = frame >= 70;

  // Smooth scroll reveal starting frame 95 -> reveals Prendas del look (4)
  const scrollY = interpolate(frame, [92, 168], [0, -450], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // External Top Headline
  const textSpring = spring({
    frame: frame - 8,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [24, 0]);
  const textOpacity = interpolate(frame, [6, 18], [0, 1], {
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
      {/* Single Headline Block */}
      <div
        style={{
          position: 'absolute',
          top: KLOZET_BRAND.layout.topHeadlineTop,
          left: 56,
          right: 56,
          textAlign: 'center',
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 50,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: KLOZET_BRAND.colors.textPrimary,
            lineHeight: 1.12,
          }}
        >
          Comparte tus looks.
        </h2>
      </div>

      <IPhoneShell
        transformStyle={`perspective(1400px) rotateY(${yaw}deg) scale(${scale})`}
        showTabBar={true}
        activeTab="feed"
        tapOverlay={
          frame >= 60 && frame < 78
            ? {
                x: 325,
                y: 440,
                progress: interpolate(frame, [60, 78], [0, 1]),
              }
            : undefined
        }
      >
        {/* Real /post/[id] Screen Reproduction */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: KLOZET_BRAND.colors.nightBg,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sticky Mobile Author Header */}
          <div
            style={{
              height: 76,
              paddingLeft: 22,
              paddingRight: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(17, 17, 19, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              zIndex: 30,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* User Avatar */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: '#27272A',
                  border: '1px solid rgba(255,255,255,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#FFF',
                }}
              >
                C
              </div>
              <span style={{ fontSize: 21, fontWeight: 700, color: '#FFFFFF' }}>
                @clara.style
              </span>
              <div
                style={{
                  paddingLeft: 18,
                  paddingRight: 18,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 9999,
                  backgroundColor: KLOZET_BRAND.colors.pink,
                  color: '#FFFFFF',
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                Seguir
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MoreVertical size={24} color="#FFFFFF" />
              <X size={24} color="#FFFFFF" />
            </div>
          </div>

          {/* Scrollable Post Content */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ transform: `translateY(${scrollY}px)` }}>
              {/* White Interactive Outfit Canvas */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 760,
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 18,
                  boxSizing: 'border-box',
                }}
              >
                <Img
                  src={staticFile('ad-assets/real/outfit-blazer-clogs.png')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />

                {/* Double-tap heart burst */}
                {heartBurstOpacity > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: heartBurstOpacity,
                      transform: `scale(${interpolate(heartBurstSpring, [0, 1], [0.2, 1.35])})`,
                    }}
                  >
                    <Heart
                      size={140}
                      color={KLOZET_BRAND.colors.pink}
                      fill={KLOZET_BRAND.colors.pink}
                      style={{ filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.28))' }}
                    />
                  </div>
                )}

                {/* Carousel Dots */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: KLOZET_BRAND.colors.pink,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#D4D4D8',
                    }}
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 18,
                  paddingBottom: 18,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <Heart
                    size={30}
                    strokeWidth={2.4}
                    color={isLiked ? KLOZET_BRAND.colors.pink : '#FFFFFF'}
                    fill={isLiked ? KLOZET_BRAND.colors.pink : 'none'}
                  />
                  <MessageCircle size={30} color="#FFFFFF" strokeWidth={2.2} />
                  <Share size={28} color="#FFFFFF" strokeWidth={2.1} />
                  <Link2 size={28} color="#FFFFFF" strokeWidth={2.1} />
                </div>
                <Bookmark size={30} color="#FFFFFF" strokeWidth={2.2} />
              </div>

              {/* Caption */}
              <div
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 18,
                  paddingBottom: 18,
                  fontSize: 21,
                  color: '#F4F4F5',
                  lineHeight: 1.4,
                }}
              >
                Blazer de cuadros con básicos neutros y zuecos para todo el día.
              </div>

              {/* Prendas del look (4) Section */}
              <div
                style={{
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 18,
                  paddingBottom: 140,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: 18,
                  }}
                >
                  Prendas del look (4)
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                  }}
                >
                  {POST_GARMENTS.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderRadius: 20,
                        backgroundColor: KLOZET_BRAND.colors.nightCard,
                        border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: 170,
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 12,
                          boxSizing: 'border-box',
                        }}
                      >
                        <Img
                          src={staticFile(item.src)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <div style={{ padding: 14 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: KLOZET_BRAND.colors.pink,
                            marginBottom: 2,
                          }}
                        >
                          {item.brand}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </IPhoneShell>
    </AbsoluteFill>
  );
};
