import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Act1CaosVortex } from './Act1CaosVortex';
import { Act2KloeChat } from './Act2KloeChat';
import { Act3OutfitAssembly } from './Act3OutfitAssembly';
import { Act4AppOpening } from './Act4AppOpening';
import { Act5AppleOutro } from './Act5AppleOutro';

export const CinematicReelsAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* High-Tension Cinematic Audio Bed (Sub-drone, Heartbeats, Silence Drop, Sub-Boom, Ambient Chord) */}
      <Audio src={staticFile('cinematic_trailer.wav')} volume={0.95} />

      {/* SFX: Low Whoosh into Kloe reveal (Act 1 -> Act 2) */}
      <Sequence from={195} durationInFrames={30}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
      </Sequence>

      {/* SFX: App launch whoosh (Act 4) */}
      <Sequence from={675} durationInFrames={35}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
      </Sequence>

      {/* Act 1: El Caos del Armario & Vórtice 3D (0s - 3.6s) */}
      <Sequence from={0} durationInFrames={215}>
        <Act1CaosVortex />
      </Sequence>

      {/* Act 2: Kloe AI · El Diálogo Puro (3.4s - 7.1s) */}
      <Sequence from={205} durationInFrames={225}>
        <Act2KloeChat />
      </Sequence>

      {/* Act 3: El Snap Magnético y Outfit Anatómico (7.0s - 10.9s) */}
      <Sequence from={420} durationInFrames={235}>
        <Act3OutfitAssembly />
      </Sequence>

      {/* Act 4: La App en el iPhone abriéndose (10.75s - 14.3s) */}
      <Sequence from={645} durationInFrames={215}>
        <Act4AppOpening />
      </Sequence>

      {/* Act 5: Outro Apple Minimal (14.1s - 16.0s) */}
      <Sequence from={845} durationInFrames={115}>
        <Act5AppleOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
