import React from 'react';
import { Composition } from 'remotion';
import { CinematicReelsAd } from './compositions/CinematicReelsAd';
import { SpotifyAppleAd } from './compositions/SpotifyAppleAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composición Cinemática Spotify 3D + Apple (9:16 Vertical - 60fps - 19.0s) */}
      <Composition
        id="SpotifyAppleAd"
        component={SpotifyAppleAd}
        durationInFrames={1140}
        fps={60}
        width={1080}
        height={1920}
      />

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
