export const BRAND_COLORS = {
  pink: '#FF66C4',
  pinkGlow: 'rgba(255, 102, 196, 0.35)',
  darkBg: '#09090b',
  black: '#000000',
  cardBg: '#121215',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F5F5F7',
  textSecondary: '#86868B',
  glassOverlay: 'rgba(255, 255, 255, 0.04)',
};

export const SPRING_PRESETS = {
  // Classic Apple snappy physics
  appleSnappy: {
    damping: 14,
    mass: 0.7,
    stiffness: 90,
  },
  // Heavy cinematic inertia for 3D devices
  heavyInertia: {
    damping: 18,
    mass: 1.2,
    stiffness: 75,
  },
  // Bouncy pop for Kloe bubble character
  kloeBouncy: {
    damping: 11,
    mass: 0.6,
    stiffness: 130,
  },
  // Ultra crisp for kinetic typography
  kineticText: {
    damping: 15,
    mass: 0.5,
    stiffness: 120,
  },
};
