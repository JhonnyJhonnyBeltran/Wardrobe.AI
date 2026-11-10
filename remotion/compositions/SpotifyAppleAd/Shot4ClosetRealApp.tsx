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
  Layers,
  CalendarDays,
  Heart,
  Search,
  Plus,
  X,
  Edit2,
  Send,
  Share2,
  LockOpen,
  Trash2,
} from 'lucide-react';
import { KLOZET_BRAND } from './klozetTokens';
import { IPhoneShell } from './IPhoneShell';

export const Shot4ClosetRealApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Device Rise entrance (Apple signature)
  const deviceSpring = spring({
    frame,
    fps,
    config: KLOZET_BRAND.springs.heavyDevice,
  });
  const phoneY = interpolate(deviceSpring, [0, 1], [150, 0]);
  const phoneRotX = interpolate(deviceSpring, [0, 1], [12, 0]);
  const phoneScale = interpolate(deviceSpring, [0, 1], [0.92, 1]);
  const gentleYaw = interpolate(frame, [0, 240], [-2.5, 2.5]);

  // Tap on Card 1 (around frame 76..90)
  const tapProgress = interpolate(frame, [74, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const card1Press =
    frame >= 74 && frame < 94
      ? interpolate(frame, [74, 82, 92], [1, 0.94, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  // OutfitDetailModal opens at frame 90
  const modalSpring = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: KLOZET_BRAND.springs.uiModal,
  });
  const modalVisible = frame >= 90;
  const modalY = interpolate(modalSpring, [0, 1], [240, 0]);

  // Strict single headline transitions (Headline A: 0..84, Headline B: 92..240)
  const headlineASpring = spring({
    frame: frame - 4,
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const headlineAOpacity = interpolate(frame, [0, 10, 74, 86], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineAY = interpolate(headlineASpring, [0, 1], [24, 0]);

  const headlineBSpring = spring({
    frame: Math.max(0, frame - 94),
    fps,
    config: KLOZET_BRAND.springs.kineticPunch,
  });
  const headlineBOpacity = interpolate(frame, [92, 102], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineBY = interpolate(headlineBSpring, [0, 1], [24, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: KLOZET_BRAND.colors.nightBg,
        overflow: 'hidden',
        fontFamily: KLOZET_BRAND.fonts.sans,
      }}
    >
      {/* Strictly ONE Headline Block Visible at Any Frame */}
      {frame < 88 ? (
        <div
          style={{
            position: 'absolute',
            top: KLOZET_BRAND.layout.topHeadlineTop,
            left: 56,
            right: 56,
            textAlign: 'center',
            opacity: headlineAOpacity,
            transform: `translateY(${headlineAY}px)`,
            zIndex: 50,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: KLOZET_BRAND.colors.textPrimary,
              lineHeight: 1.12,
            }}
          >
            Tu armario, organizado.
          </h2>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: KLOZET_BRAND.layout.topHeadlineTop,
            left: 56,
            right: 56,
            textAlign: 'center',
            opacity: headlineBOpacity,
            transform: `translateY(${headlineBY}px)`,
            zIndex: 50,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: KLOZET_BRAND.colors.textPrimary,
              lineHeight: 1.12,
            }}
          >
            Cada look al detalle.
          </h2>
        </div>
      )}

      {/* Real iPhone 16 Pro Titanium running /closet */}
      <IPhoneShell
        transformStyle={`perspective(1400px) translateY(${phoneY}px) rotateX(${phoneRotX}deg) rotateY(${gentleYaw}deg) scale(${phoneScale})`}
        showTabBar={!modalVisible}
        activeTab="closet"
        tapOverlay={{ x: 175, y: 420, progress: tapProgress }}
      >
        {/* /closet Screen Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: KLOZET_BRAND.colors.nightBg,
            paddingLeft: 22,
            paddingRight: 22,
            paddingTop: 10,
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar: Standalone Kloe Avatar + "Charla conmigo" */}
          <div
            style={{
              height: 76,
              borderRadius: 24,
              backgroundColor: KLOZET_BRAND.colors.nightCard,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              marginBottom: 14,
            }}
          >
            <Img
              src={staticFile('kloe-avatar-v2.png')}
              style={{ width: 46, height: 46, objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: 23,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Charla conmigo
            </span>
          </div>

          {/* 3-Tab Sub-Navigation (Shirt | Layers Active | Calendar) */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: 22,
            }}
          >
            <div
              style={{
                flex: 1,
                paddingTop: 16,
                paddingBottom: 16,
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '3px solid transparent',
              }}
            >
              <Shirt size={30} color="#71717A" strokeWidth={1.8} />
            </div>
            <div
              style={{
                flex: 1,
                paddingTop: 16,
                paddingBottom: 16,
                display: 'flex',
                justifyContent: 'center',
                borderBottom: `3px solid ${KLOZET_BRAND.colors.pink}`,
              }}
            >
              <Layers size={30} color={KLOZET_BRAND.colors.pink} strokeWidth={2.2} />
            </div>
            <div
              style={{
                flex: 1,
                paddingTop: 16,
                paddingBottom: 16,
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '3px solid transparent',
              }}
            >
              <CalendarDays size={30} color="#71717A" strokeWidth={1.8} />
            </div>
          </div>

          {/* 2-Column Real Outfits Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            {/* Card 1: Cream sweater + jeans + gold hoops + Birkenstock clogs (Screenshot #1 match!) */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                transform: `scale(${card1Press})`,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 10,
                }}
              >
                <Heart size={24} color="#71717A" strokeWidth={1.9} />
              </div>
              {/* Assembled flat-lay pieces inside Card 1 */}
              <Img
                src={staticFile('ad-assets/real/zara-jersey-crema.png')}
                style={{
                  position: 'absolute',
                  top: '7%',
                  right: '14%',
                  width: '54%',
                  height: '38%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/jeans-recto-azul.png')}
                style={{
                  position: 'absolute',
                  bottom: '7%',
                  right: '16%',
                  width: '40%',
                  height: '50%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/pendientes-aros-oro.png')}
                style={{
                  position: 'absolute',
                  top: '44%',
                  left: '11%',
                  width: '26%',
                  height: '20%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/zuecos-tachuelas.png')}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '11%',
                  width: '27%',
                  height: '23%',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Card 2: User real Download #1 Collage */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
                <Heart size={24} color={KLOZET_BRAND.colors.pink} fill={KLOZET_BRAND.colors.pink} />
              </div>
              <Img
                src={staticFile('ad-assets/real/outfit-cream-gazelle.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: 8,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Card 3: User real Download #2 Collage */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
                <Heart size={24} color="#71717A" strokeWidth={1.9} />
              </div>
              <Img
                src={staticFile('ad-assets/real/outfit-blazer-clogs.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: 8,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Card 4: Curated Street Casual using real cutouts */}
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
                <Heart size={24} color="#71717A" strokeWidth={1.9} />
              </div>
              <Img
                src={staticFile('ad-assets/real/camiseta-blanca-larga.png')}
                style={{
                  position: 'absolute',
                  top: '9%',
                  left: '16%',
                  width: '50%',
                  height: '36%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/gafas-blancas.png')}
                style={{
                  position: 'absolute',
                  top: '14%',
                  right: '10%',
                  width: '32%',
                  height: '16%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/jeans-recto-azul.png')}
                style={{
                  position: 'absolute',
                  bottom: '8%',
                  right: '18%',
                  width: '40%',
                  height: '48%',
                  objectFit: 'contain',
                }}
              />
              <Img
                src={staticFile('ad-assets/real/adidas-gazelle-marron.png')}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '10%',
                  width: '40%',
                  height: '22%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Floating Pink Action Circles Bottom Right (exact Screenshot #1) */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: 132,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: 40,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: KLOZET_BRAND.colors.pink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              }}
            >
              <Search size={30} color="#FFFFFF" strokeWidth={2.3} />
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: KLOZET_BRAND.colors.pink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              }}
            >
              <Plus size={34} color="#FFFFFF" strokeWidth={2.4} />
            </div>
          </div>

          {/* OutfitDetailModal Overlay (Exact Screenshot #2!) */}
          {modalVisible && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 18,
                paddingBottom: 24,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 85,
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
                  transform: `translateY(${modalY}px)`,
                  opacity: modalSpring,
                  boxShadow: '0 30px 70px rgba(0,0,0,0.85)',
                }}
              >
                {/* White Interactive Outfit Canvas Top Half */}
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top-right Favorite & Close Buttons */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      display: 'flex',
                      gap: 12,
                      zIndex: 20,
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

                  {/* Interactive Garments matching Screenshot #2 layout */}
                  <Img
                    src={staticFile('ad-assets/real/zara-jersey-crema.png')}
                    style={{
                      position: 'absolute',
                      top: '6%',
                      left: '34%',
                      width: '48%',
                      height: '33%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))',
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
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))',
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
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))',
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
                      filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.14))',
                    }}
                  />

                  {/* Bottom Hint Capsule */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 18,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        paddingLeft: 18,
                        paddingRight: 18,
                        paddingTop: 8,
                        paddingBottom: 8,
                        borderRadius: 9999,
                        backgroundColor: 'rgba(244, 244, 245, 0.94)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: '#71717A',
                      }}
                    >
                      TOCA UNA PRENDA PARA VER DETALLES
                    </div>
                  </div>
                </div>

                {/* Dark Details Panel Bottom Half */}
                <div
                  style={{
                    backgroundColor: KLOZET_BRAND.colors.nightBg,
                    padding: 24,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {/* Tags Row */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingLeft: 14,
                        paddingRight: 14,
                        paddingTop: 7,
                        paddingBottom: 7,
                        borderRadius: 9999,
                        backgroundColor: KLOZET_BRAND.colors.nightCard,
                        border: '1px solid rgba(255,255,255,0.09)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#D4D4D8',
                      }}
                    >
                      <Layers size={16} color={KLOZET_BRAND.colors.pink} />
                      <span>4 prendas</span>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingLeft: 14,
                        paddingRight: 14,
                        paddingTop: 7,
                        paddingBottom: 7,
                        borderRadius: 9999,
                        backgroundColor: KLOZET_BRAND.colors.nightCard,
                        border: '1px solid rgba(255,255,255,0.09)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#D4D4D8',
                      }}
                    >
                      <LockOpen size={16} color={KLOZET_BRAND.colors.pink} />
                      <span>Público</span>
                    </div>
                  </div>

                  {/* Outfit Title */}
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Listo
                  </div>

                  {/* Primary Action Pills: Editar look + Publicar */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 60,
                        borderRadius: 9999,
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
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
                        border: '1px solid rgba(255, 102, 196, 0.35)',
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

                  {/* Secondary Action Row */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 52,
                        borderRadius: 9999,
                        backgroundColor: KLOZET_BRAND.colors.nightCard,
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
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
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: 17,
                        fontWeight: 600,
                      }}
                    >
                      <LockOpen size={18} color={KLOZET_BRAND.colors.pink} />
                      <span>Público</span>
                    </div>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.14)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </IPhoneShell>
    </AbsoluteFill>
  );
};
