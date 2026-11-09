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
      {/* Background Cinematic Music Bed */}
      <Audio src={staticFile('music.wav')} volume={0.82} />

      {/* SFX: Whoosh into Kloe chat (Act 1 -> Act 2) */}
      <Sequence from={185} durationInFrames={35}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.65} />
      </Sequence>

      {/* SFX: Click when Kloe generates outfit (Act 2) */}
      <Sequence from={350} durationInFrames={25}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.7} />
      </Sequence>

      {/* SFX: Snap impact on outfit assembly (Act 3, frame 475) */}
      <Sequence from={475} durationInFrames={40}>
        <Audio src={staticFile('sfx/hit.wav')} volume={0.85} />
      </Sequence>

      {/* SFX: App launch whoosh (Act 4, frame 650) */}
      <Sequence from={650} durationInFrames={35}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
      </Sequence>

      {/* Act 1: El Caos del Armario & Vórtice 3D (0s - 3.3s) */}
      <Sequence from={0} durationInFrames={205}>
        <Act1CaosVortex />
      </Sequence>

      {/* Act 2: Kloe AI · La Interacción (3.1s - 6.8s) */}
      <Sequence from={190} durationInFrames={225}>
        <Act2KloeChat />
      </Sequence>

      {/* Act 3: Selección y Ensamblaje del Outfit (6.6s - 10.3s) */}
      <Sequence from={400} durationInFrames={225}>
        <Act3OutfitAssembly />
      </Sequence>

      {/* Act 4: La App en el iPhone abriéndose (10.1s - 13.6s) */}
      <Sequence from={610} durationInFrames={215}>
        <Act4AppOpening />
      </Sequence>

      {/* Act 5: Apple Outro & Call to Action (13.4s - 16.0s) */}
      <Sequence from={810} durationInFrames={150}>
        <Act5AppleOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
