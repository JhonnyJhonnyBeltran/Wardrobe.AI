import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Scene1Hook } from './Scene1Hook';
import { Scene2DeviceRise } from './Scene2DeviceRise';
import { Scene3KloeAI } from './Scene3KloeAI';
import { Scene4Outro } from './Scene4Outro';

export const KlozetAppleAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Scene 1: The Kinetic Hook (0s - 2.0s) */}
      <Sequence from={0} durationInFrames={120}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: 3D Device Rise & Garment Scanning (1.75s - 5.0s) */}
      <Sequence from={105} durationInFrames={195}>
        <Scene2DeviceRise />
      </Sequence>

      {/* Scene 3: Kloe AI Stylist & Layered Outfit Snap (4.75s - 8.0s) */}
      <Sequence from={285} durationInFrames={195}>
        <Scene3KloeAI />
      </Sequence>

      {/* Scene 4: Apple-style Outro & Call to Action (7.75s - 10.0s) */}
      <Sequence from={465} durationInFrames={135}>
        <Scene4Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
