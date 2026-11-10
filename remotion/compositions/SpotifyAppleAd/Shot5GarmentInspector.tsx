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
  Shirt,
  Tag,
  Layers,
  CalendarDays,
  Heart,
  X,
  Edit2,
  Send,
  Share2,
  LockOpen,
  Trash2,
} from 'lucide-react';
import { KLOZET_BRAND } from './klozetTokens';
import { IPhoneShell } from './IPhoneShell';

export const Shot5GarmentInspector: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle camera push + angle glide across the iPhone
  const gentleYaw = interpolate(frame, [0, 180], [2.5, -3.5]);
  const gentleScale = interpolate(frame, [0, 180], [1, 1.03]);

  // Tap directly onto the cream sweater inside OutfitDetailModal (frames 8..24)
  const tapProgress = interpolate(frame, [6, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sweaterHighlight =
    frame >= 6 && frame < 26
      ? interpolate(frame, [6, 15, 25], [1, 1.08, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  // ProductModal slides up cleanly at frame 24 (matching Screenshot #3 pixel-for-pixel!)
  const productModalVisible = frame >= 24;
  const modalSpring = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: KLOZET_BRAND.springs.uiModal,
  });
  const modalY = interpolate(modalSpring, [0, 1], [320, 0]);

  // Single Top Headline
  const textSpring = spring({
    frame: frame - 12,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const textY = interpolate(textSpring, [0, 1], [24, 0]);
  const textOpacity = interpolate(frame, [10, 22], [0, 1], {
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
      {/* Single Monolithic Headline */}
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
          Toca una prenda. Mírala real.
        </h2>
      </div>

      <IPhoneShell
        transformStyle={`perspective(1400px) rotateY(${gentleYaw}deg) scale(${gentleScale})`}
        showTabBar={false}
        tapOverlay={{ x: 365, y: 265, progress: tapProgress }}
      >
        {/* Background Layer: OutfitDetailModal */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 18,
            paddingBottom: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              borderRadius: 42,
              backgroundColor: KLOZET_BRAND.colors.nightBg,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', flex: 1, backgroundColor: '#FFFFFF' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  display: 'flex',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24,24,27,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={22} color="#FFFFFF" strokeWidth={2} />
                </div>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(24,24,27,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={22} color="#FFFFFF" strokeWidth={2.2} />
                </div>
              </div>

              <Img
                src={staticFile('ad-assets/real/zara-jersey-crema.png')}
                style={{
                  position: 'absolute',
                  top: '6%',
                  left: '34%',
                  width: '48%',
                  height: '33%',
                  objectFit: 'contain',
                  transform: `scale(${sweaterHighlight})`,
                }}
              />
              <Img
                src={staticFile('ad-assets/real/jeans-recto-azul.png')}
                style={{
                  position: 'absolute',
                  top: '38%',
                  left: '40%',
                  width: '36%',
                  height: '50%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/pendientes-aros-oro.png')}
                style={{
                  position: 'absolute',
                  top: '39%',
                  left: '11%',
                  width: '23%',
                  height: '18%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/zuecos-tachuelas.png')}
                style={{
                  position: 'absolute',
                  bottom: '13%',
                  left: '12%',
                  width: '23%',
                  height: '22%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: KLOZET_BRAND.colors.nightBg,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 700, color: '#FFFFFF' }}>Listo</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    height: 60,
                    borderRadius: 9999,
                    backgroundColor: '#FFFFFF',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  <Edit2 size={20} />
                  <span>Editar look</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 60,
                    borderRadius: 9999,
                    backgroundColor: 'rgba(255, 102, 196, 0.16)',
                    color: KLOZET_BRAND.colors.pink,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  <Send size={20} />
                  <span>Publicar</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 9999,
                    backgroundColor: KLOZET_BRAND.colors.nightCard,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 17,
                    fontWeight: 600,
                  }}
                >
                  <Share2 size={18} color={KLOZET_BRAND.colors.pink} />
                  <span>Generar sticker</span>
                </div>
                <div
                  style={{
                    height: 52,
                    paddingLeft: 18,
                    paddingRight: 18,
                    borderRadius: 9999,
                    backgroundColor: KLOZET_BRAND.colors.nightCard,
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 17,
                    fontWeight: 600,
                  }}
                >
                  <LockOpen size={18} color={KLOZET_BRAND.colors.pink} />
                  <span>Público</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ProductModal Foreground (Exact Screenshot #3 Match!) */}
        {productModalVisible && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 18,
              paddingBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 88,
            }}
          >
            <div
              style={{
                flex: 1,
                borderRadius: 42,
                backgroundColor: KLOZET_BRAND.colors.nightBg,
                border: '1px solid rgba(255, 255, 255, 0.14)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(${modalY}px)`,
                opacity: modalSpring,
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.9)',
              }}
            >
              {/* White Product Stage */}
              <div
                style={{
                  position: 'relative',
                  height: '44%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 36,
                  boxSizing: 'border-box',
                }}
              >
                <Img
                  src={staticFile('ad-assets/real/zara-jersey-crema.png')}
                  style={{
                    maxWidth: '88%',
                    maxHeight: '88%',
                    objectFit: 'contain',
                    transform: `scale(${interpolate(modalSpring, [0, 1], [1.08, 1])})`,
                  }}
                />
              </div>

              {/* Dark Product Info Grid (Screenshot #3 Exact Match!) */}
              <div
                style={{
                  flex: 1,
                  padding: 28,
                  backgroundColor: KLOZET_BRAND.colors.nightBg,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: KLOZET_BRAND.colors.pink,
                    marginBottom: 6,
                  }}
                >
                  Zara
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    lineHeight: 1.18,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    marginBottom: 24,
                  }}
                >
                  Jersey de punto básico color crema
                </div>

                {/* 2-Column Apple Specs Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                    marginBottom: 26,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                    }}
                  >
                    <Shirt size={24} color={KLOZET_BRAND.colors.pink} />
                    <div>
                      <div style={{ fontSize: 15, color: '#8E8E93' }}>Tipo</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#FFF' }}>Jersey</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                    }}
                  >
                    <Tag size={24} color={KLOZET_BRAND.colors.pink} />
                    <div>
                      <div style={{ fontSize: 15, color: '#8E8E93' }}>Marca</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#FFF' }}>Zara</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#E8DEC8',
                        border: '2px solid rgba(255,255,255,0.2)',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 15, color: '#8E8E93' }}>Color</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#FFF' }}>Beige</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                    }}
                  >
                    <Layers size={24} color={KLOZET_BRAND.colors.pink} />
                    <div>
                      <div style={{ fontSize: 15, color: '#8E8E93' }}>Tejido</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#FFF' }}>Punto</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: 16,
                      borderRadius: 18,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                    }}
                  >
                    <CalendarDays size={24} color={KLOZET_BRAND.colors.pink} />
                    <div>
                      <div style={{ fontSize: 15, color: '#8E8E93' }}>Temporada</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: '#FFF' }}>Winter</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Edit + Delete Row */}
                <div style={{ display: 'flex', gap: 14, marginTop: 'auto' }}>
                  <div
                    style={{
                      flex: 1,
                      height: 62,
                      borderRadius: 20,
                      backgroundColor: KLOZET_BRAND.colors.nightCard,
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    <Edit2 size={20} />
                    <span>Editar</span>
                  </div>
                  <div
                    style={{
                      width: 66,
                      height: 62,
                      borderRadius: 20,
                      backgroundColor: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={22} color="#EF4444" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </IPhoneShell>
    </AbsoluteFill>
  );
};
