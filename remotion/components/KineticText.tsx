import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SPRING_PRESETS } from '../constants';

interface KineticTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  highlightWords?: string[];
  highlightColor?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  fontSize = 64,
  color = '#F5F5F7',
  fontWeight = 700,
  highlightWords = [],
  highlightColor = '#FF66C4',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.3em',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        letterSpacing: '-0.03em',
      }}
    >
      {words.map((word, index) => {
        const wordDelay = delay + index * 4;
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: SPRING_PRESETS.kineticText,
        });

        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const scale = interpolate(progress, [0, 1], [0.9, 1]);

        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
        const isHighlight = highlightWords.includes(cleanWord);

        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight,
              color: isHighlight ? highlightColor : color,
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              textShadow: isHighlight
                ? `0 0 35px ${highlightColor}66`
                : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
