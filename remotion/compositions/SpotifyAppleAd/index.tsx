import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
} from 'remotion';
import { Shot1LogoDark } from './Shot1LogoDark';
import { Shot2DilemaVortex } from './Shot2DilemaVortex';
import { Shot3KloeIntervenes } from './Shot3KloeIntervenes';
import { Shot4ClosetRealApp } from './Shot4ClosetRealApp';
import { Shot5GarmentInspector } from './Shot5GarmentInspector';
import { Shot6PostFeedScreen } from './Shot6PostFeedScreen';
import { Shot7OutroLogo } from './Shot7OutroLogo';

/**
 * SpotifyAppleAd (120 BPM · 19.0s · 1140 frames @ 60fps · 1080x1920 Vertical)
 * Strictly obeys Obsidian/brand_kit.md & real /closet + /post UI screenshots:
 * - Zero enclosing circles around Klozet / Kloe logos
 * - Real /descargas garments & outfits cleanly integrated
 * - Real /closet -> OutfitDetailModal -> ProductModal -> /post UI flow
 * - Beat-locked cuts every 30 frames (0.5s per beat) with -17.4 LUFS master bed
 */
export const SpotifyAppleAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#111113' }}>
      {/* Beat-locked 120 BPM master soundtrack (drop exact at F330, finale hit at F960) */}
      <Audio
        src={staticFile('ad-assets/soundtrack-klozet-v2.wav')}
        volume={0.95}
      />

      {/* Synchronized UI Foley & Motion Transitions */}
      {/* Beat 3 (F90): Transition whoosh into swirling garments */}
      <Sequence from={86} durationInFrames={36}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.38} />
      </Sequence>

      {/* Beat 7 (F210): Soft freeze swish when Kloe enters */}
      <Sequence from={208} durationInFrames={30}>
        <Audio src={staticFile('sfx/swish.wav')} volume={0.35} />
      </Sequence>

      {/* Tap Card 1 in /closet (F410) */}
      <Sequence from={408} durationInFrames={20}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.68} />
      </Sequence>

      {/* Tap cream sweater in OutfitDetailModal (F582) */}
      <Sequence from={580} durationInFrames={20}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.68} />
      </Sequence>

      {/* Transition swipe into /post (F746) */}
      <Sequence from={745} durationInFrames={28}>
        <Audio src={staticFile('sfx/swish.wav')} volume={0.35} />
      </Sequence>

      {/* Double-tap heart burst in /post (F818) */}
      <Sequence from={818} durationInFrames={22}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.72} />
      </Sequence>

      {/* Beat-Locked Contiguous Shots (1 beat = 30 frames @ 60fps) */}

      {/* Shot 1: Standalone Klozet Wordmark + Hook (Beats 0..3 · F0–F90) */}
      <Sequence from={0} durationInFrames={90}>
        <Shot1LogoDark />
      </Sequence>

      {/* Shot 2: Real Garments Vortex from /descargas (Beats 3..7 · F90–F210) */}
      <Sequence from={90} durationInFrames={120}>
        <Shot2DilemaVortex />
      </Sequence>

      {/* Shot 3: Standalone Kloe + Vacuum Tension Drop (Beats 7..11 · F210–F330) */}
      <Sequence from={210} durationInFrames={120}>
        <Shot3KloeIntervenes />
      </Sequence>

      {/* Shot 4: Real /closet Grid -> Tap -> OutfitDetailModal (Beats 11..19 · F330–F570) */}
      <Sequence from={330} durationInFrames={240}>
        <Shot4ClosetRealApp />
      </Sequence>

      {/* Shot 5: Tap Sweater -> Real Zara ProductModal (Beats 19..25 · F570–F750) */}
      <Sequence from={570} durationInFrames={180}>
        <Shot5GarmentInspector />
      </Sequence>

      {/* Shot 6: Real /post Feed -> Double-Tap Heart + Prendas del look (Beats 25..32 · F750–F960) */}
      <Sequence from={750} durationInFrames={210}>
        <Shot6PostFeedScreen />
      </Sequence>

      {/* Shot 7: Finale Standalone Klozet & Kloe Logos + CTA (Beats 32..38 · F960–F1140) */}
      <Sequence from={960} durationInFrames={180}>
        <Shot7OutroLogo />
      </Sequence>
    </AbsoluteFill>
  );
};
