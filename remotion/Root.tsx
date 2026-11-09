import React from 'react';
import { Composition } from 'remotion';
import { KlozetAppleAd } from './compositions/KlozetAppleAd';
import { KlozetArmarioLlenoAd } from './compositions/KlozetArmarioLleno';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Nuevo Anuncio Apple: "Tu armario está lleno... pero no encuentras qué te encaje" */}
      <Composition
        id="KlozetArmarioLleno"
        component={KlozetArmarioLlenoAd}
        durationInFrames={810}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="KlozetArmarioLlenoVertical"
        component={KlozetArmarioLlenoAd}
        durationInFrames={810}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* Anuncio Teaser Inicial (10s) */}
      <Composition
        id="KlozetAppleAd"
        component={KlozetAppleAd}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />

      <Composition
        id="KlozetAppleAdVertical"
        component={KlozetAppleAd}
        durationInFrames={600}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
