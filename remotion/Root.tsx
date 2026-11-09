import React from 'react';
import { Composition } from 'remotion';
import { CinematicReelsAd } from './compositions/CinematicReelsAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composición Cinemática Apple (9:16 Vertical para Reels, TikTok, Shorts - 60fps) */}
      <Composition
        id="CinematicReelsAd"
        component={CinematicReelsAd}
        durationInFrames={960}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
