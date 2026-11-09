import React from 'react';
import { Composition } from 'remotion';
import { KlozetAppleAd } from './compositions/KlozetAppleAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Landscape - Keynote / YouTube / Website Header (1080p 60fps) */}
      <Composition
        id="KlozetAppleAd"
        component={KlozetAppleAd}
        durationInFrames={600}
        fps={60}
        width={1920}
        height={1080}
      />

      {/* 9:16 Vertical - Instagram Reels / TikTok / YouTube Shorts */}
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
