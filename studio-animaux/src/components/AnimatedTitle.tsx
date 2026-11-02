import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, SAFE, W, outlinedText} from '../theme';
import type {TitleSegment} from '../types';

// Titre « Pourquoi... » construit segment par segment, sans rectangle de fond.
export const AnimatedTitle: React.FC<{segments: TitleSegment[]; fontSize?: number}> = ({segments, fontSize = 78}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: SAFE.top + 20, left: SAFE.left, width: W - 2 * SAFE.left,
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: fontSize * 0.28, lineHeight: 1.12, textAlign: 'center'}}>
      {segments.map((s, i) => {
        const p = spring({frame: frame - Math.round(s.at * fps), fps, config: {damping: 12, stiffness: 160}});
        if (frame < s.at * fps) return null;
        return (
          <span key={i} style={{...outlinedText(fontSize * 0.2), fontSize,
            color: s.highlight ? COLORS.jaune : COLORS.blanc,
            display: 'inline-block', opacity: Math.min(1, p * 1.5),
            transform: `translateY(${(1 - p) * 30}px) scale(${0.6 + 0.4 * p})`}}>
            {s.text}
          </span>
        );
      })}
    </div>
  );
};
