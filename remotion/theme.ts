export const THEME = {
  colors: {
    black: '#000000',
    deepVoid: '#070709',
    surface: '#111116',
    surfaceElevated: '#17171e',
    brandPink: '#FF66C4',
    brandPinkGlow: 'rgba(255, 102, 196, 0.4)',
    brandPinkSoft: 'rgba(255, 102, 196, 0.15)',
    textPrimary: '#F5F5F7',
    textSecondary: '#86868B',
    textMuted: '#55555e',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderGlass: 'rgba(255, 255, 255, 0.16)',
    borderPink: 'rgba(255, 102, 196, 0.35)',
    glassBg: 'rgba(20, 20, 26, 0.75)',
  },
  springs: {
    // Calibrated Apple Keynote springs (damping, stiffness, mass)
    appleSnappy: { damping: 15.3, stiffness: 115.0, mass: 1 },
    heavyDevice: { damping: 18.0, stiffness: 75.0, mass: 1.2 },
    kloeBouncy: { damping: 11.5, stiffness: 135.0, mass: 0.6 },
    kineticPunch: { damping: 14.0, stiffness: 140.0, mass: 0.8 },
    magneticSnap: { damping: 13.0, stiffness: 130.0, mass: 0.75 },
    gentleFloat: { damping: 24.0, stiffness: 45.0, mass: 1.5 },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro", "Inter", sans-serif',
    trackingTight: '-0.035em',
    trackingHeadline: '-0.025em',
    trackingBadge: '0.18em',
  },
  layout: {
    width: 1080,
    height: 1920,
    // Safe area margins for TikTok / Instagram Reels overlays
    safeTop: 180,
    safeBottom: 240,
    safePaddingX: 64,
  },
};
