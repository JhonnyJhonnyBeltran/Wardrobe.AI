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
import { Shot4MixAndMatch } from './Shot4MixAndMatch';
import { Shot5CollageCards } from './Shot5CollageCards';
import { Shot6IPhoneCanvas } from './Shot6IPhoneCanvas';
import { Shot7OutroLogo } from './Shot7OutroLogo';

export const SpotifyAppleAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Primary Soundtrack: Sub-drone 42Hz + Heartbeat 120BPM + Silence drop + Sub-boom hits */}
      <Audio
        src={staticFile('ad-assets/soundtrack-spotify-apple.wav')}
        volume={0.95}
      />

      {/* Synchronized SFX Layers */}
      {/* F135: Whoosh into clothes vortex */}
      <Sequence from={135} durationInFrames={50}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} />
      </Sequence>

      {/* F275: Swish freeze when Kloe intervenes */}
      <Sequence from={275} durationInFrames={40}>
        <Audio src={staticFile('sfx/swish.wav')} volume={0.4} />
      </Sequence>

      {/* F448: Sub-impact hit on Mix & Match bifurcation */}
      <Sequence from={448} durationInFrames={70}>
        <Audio src={staticFile('sfx/hit.wav')} volume={0.65} />
      </Sequence>

      {/* F628: Impact hit on 3D magazine cards arrival */}
      <Sequence from={628} durationInFrames={70}>
        <Audio src={staticFile('sfx/hit.wav')} volume={0.55} />
      </Sequence>

      {/* F820: Tactile click when outfit docks into iPhone canvas */}
      <Sequence from={820} durationInFrames={30}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.7} />
      </Sequence>

      {/* F940: Subtle riser leading to final logo return */}
      <Sequence from={940} durationInFrames={55}>
        <Audio src={staticFile('sfx/riser.wav')} volume={0.35} />
      </Sequence>

      {/* Visual Sequence Shots with 20-frame cross-dissolve overlaps */}

      {/* Shot 1: Logo in the dark (F0 - F160) */}
      <Sequence from={0} durationInFrames={160}>
        <Shot1LogoDark />
      </Sequence>

      {/* Shot 2: Clothes Vortex Dilemma (F140 - F300) */}
      <Sequence from={140} durationInFrames={160}>
        <Shot2DilemaVortex />
      </Sequence>

      {/* Shot 3: Kloe Intervenes / The Freeze (F280 - F460) */}
      <Sequence from={280} durationInFrames={180}>
        <Shot3KloeIntervenes />
      </Sequence>

      {/* Shot 4: Mix & Match bifurcation (F440 - F630) */}
      <Sequence from={440} durationInFrames={190}>
        <Shot4MixAndMatch />
      </Sequence>

      {/* Shot 5: 3D Spotify Cards / Collages (F610 - F810) */}
      <Sequence from={610} durationInFrames={200}>
        <Shot5CollageCards />
      </Sequence>

      {/* Shot 6: Real App Canvas inside iPhone 16 Pro (F790 - F990) */}
      <Sequence from={790} durationInFrames={200}>
        <Shot6IPhoneCanvas />
      </Sequence>

      {/* Shot 7: Logo returns + Outro Specular CTA (F970 - F1140) */}
      <Sequence from={970} durationInFrames={170}>
        <Shot7OutroLogo />
      </Sequence>
    </AbsoluteFill>
  );
};
