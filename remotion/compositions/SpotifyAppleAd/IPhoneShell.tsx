import React from 'react';
import { Img, staticFile } from 'remotion';
import { Home, Search, Heart, UserRound } from 'lucide-react';
import { KLOZET_BRAND } from './klozetTokens';

interface IPhoneShellProps {
  children: React.ReactNode;
  transformStyle?: string;
  opacity?: number;
  showTabBar?: boolean;
  activeTab?: 'feed' | 'search' | 'closet' | 'notifications' | 'profile';
  tapOverlay?: {
    x: number; // px within 650px inner width
    y: number; // px within 1340px inner height
    progress: number; // 0..1 active tap pulse
  };
}

export const IPhoneShell: React.FC<IPhoneShellProps> = ({
  children,
  transformStyle = '',
  opacity = 1,
  showTabBar = true,
  activeTab = 'closet',
  tapOverlay,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: KLOZET_BRAND.layout.phoneTop,
        left: '50%',
        width: KLOZET_BRAND.layout.phoneWidth,
        height: KLOZET_BRAND.layout.phoneHeight,
        transform: `translateX(-50%) ${transformStyle}`,
        transformStyle: 'preserve-3d',
        opacity,
        zIndex: 20,
      }}
    >
      {/* Titanium outer frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 74,
          padding: 13,
          background: '#1E1E22',
          border: '2px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 45px 100px rgba(0, 0, 0, 0.88)',
          boxSizing: 'border-box',
        }}
      >
        {/* Inner OLED Screen (#111113 official dark background) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 62,
            backgroundColor: KLOZET_BRAND.colors.nightBg,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: KLOZET_BRAND.fonts.sans,
          }}
        >
          {/* iOS Status Bar + Dynamic Island */}
          <div
            style={{
              height: 70,
              paddingLeft: 38,
              paddingRight: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 80,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 21,
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              9:41
            </span>

            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 17,
                transform: 'translateX(-50%)',
                width: 164,
                height: 44,
                borderRadius: 24,
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 16,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#121521',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>

            {/* Signal + Wifi + Battery */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 15 }}>
                <div style={{ width: 3.5, height: 5, borderRadius: 1, backgroundColor: '#FFF' }} />
                <div style={{ width: 3.5, height: 8, borderRadius: 1, backgroundColor: '#FFF' }} />
                <div style={{ width: 3.5, height: 11, borderRadius: 1, backgroundColor: '#FFF' }} />
                <div style={{ width: 3.5, height: 14, borderRadius: 1, backgroundColor: '#FFF' }} />
              </div>
              <div
                style={{
                  width: 32,
                  height: 16,
                  borderRadius: 5,
                  border: '1.8px solid rgba(255,255,255,0.55)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '82%',
                    height: '100%',
                    borderRadius: 2.5,
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            {children}
          </div>

          {/* Authentic Floating Apple Glass Capsule TabBar (.apple-glass-bar) */}
          {showTabBar && (
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 26,
                right: 26,
                height: 82,
                borderRadius: 9999,
                backgroundColor: 'rgba(17, 17, 19, 0.86)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingLeft: 12,
                paddingRight: 12,
                zIndex: 70,
              }}
            >
              <Home
                size={31}
                strokeWidth={activeTab === 'feed' ? 2.5 : 1.8}
                color={activeTab === 'feed' ? KLOZET_BRAND.colors.pink : '#A1A1AA'}
              />
              <Search
                size={31}
                strokeWidth={activeTab === 'search' ? 2.5 : 1.8}
                color={activeTab === 'search' ? KLOZET_BRAND.colors.pink : '#A1A1AA'}
              />
              {/* Standalone Klozet K mark — NO circle container */}
              <div
                style={{
                  width: 58,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Img
                  src={staticFile('k-bubble-pink.png')}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'contain',
                  }}
                />
              </div>
              <Heart
                size={31}
                strokeWidth={activeTab === 'notifications' ? 2.5 : 1.8}
                color={activeTab === 'notifications' ? KLOZET_BRAND.colors.pink : '#A1A1AA'}
              />
              <UserRound
                size={31}
                strokeWidth={activeTab === 'profile' ? 2.5 : 1.8}
                color={activeTab === 'profile' ? KLOZET_BRAND.colors.pink : '#A1A1AA'}
              />
            </div>
          )}

          {/* Subtle iOS Touch Pointer Ripple when tapping inside screen */}
          {tapOverlay && tapOverlay.progress > 0 && tapOverlay.progress < 1 && (
            <div
              style={{
                position: 'absolute',
                left: tapOverlay.x,
                top: tapOverlay.y,
                width: 68,
                height: 68,
                marginLeft: -34,
                marginTop: -34,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.28)',
                border: '2px solid rgba(255, 255, 255, 0.85)',
                transform: `scale(${0.65 + tapOverlay.progress * 0.7})`,
                opacity: 1 - tapOverlay.progress,
                pointerEvents: 'none',
                zIndex: 95,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
