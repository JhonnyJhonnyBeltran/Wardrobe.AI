import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Scene1Dilema } from './Scene1Dilema';
import { Scene2IPhone } from './Scene2IPhone';
import { Scene3OutfitSnap } from './Scene3OutfitSnap';
import { Scene4FinalOutro } from './Scene4FinalOutro';

export const KlozetArmarioLlenoAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Synthesized Apple Keynote Audio Bed */}
      <Audio src={staticFile('music.wav')} volume={0.8} />

      {/* SFX: Whoosh between scene 1 and 2 */}
      <Sequence from={160} durationInFrames={30}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
      </Sequence>

      {/* SFX: Hit on clothing snap impact (Scene 3, frame 440) */}
      <Sequence from={440} durationInFrames={40}>
        <Audio src={staticFile('sfx/hit.wav')} volume={0.8} />
      </Sequence>

      {/* Scene 1: "Tu armario está lleno... pero no encuentras qué te encaje." */}
      <Sequence from={0} durationInFrames={180}>
        <Scene1Dilema />
      </Sequence>

      {/* Scene 2: "Entra Klozet. Tu armario en tu iPhone." */}
      <Sequence from={165} durationInFrames={210}>
        <Scene2IPhone />
      </Sequence>

      {/* Scene 3: Las prendas sueltas del proyecto volando y montándose en el outfit */}
      <Sequence from={360} durationInFrames={270}>
        <Scene3OutfitSnap />
      </Sequence>

      {/* Scene 4: Logo oficial de Klozet, claim y CTA */}
      <Sequence from={615} durationInFrames={195}>
        <Scene4FinalOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
