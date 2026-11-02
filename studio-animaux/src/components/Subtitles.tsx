import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, H, SAFE, W, outlinedText} from '../theme';
import type {Word} from '../types';

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');

// Regroupe les mots réels en petits groupes (max N mots, coupe aux pauses et ponctuation).
export const groupWords = (words: Word[], maxWords = 3, pause = 0.35) => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const endPunct = /[.,!?;:…]$/.test(w.text);
    if (!next || cur.length >= maxWords || endPunct || next.start - w.end > pause) {
      groups.push(cur);
      cur = [];
    }
  });
  return groups;
};

export const Subtitles: React.FC<{words: Word[]; jaunes: string[]; fontSize?: number}> = ({words, jaunes, fontSize = 74}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => groupWords(words), [words]);
  const jauneSet = useMemo(() => new Set(jaunes.map(norm)), [jaunes]);
  const idx = groups.findIndex((g, i) => t >= g[0].start && t < (groups[i + 1]?.[0].start ?? g[g.length - 1].end + 0.4));
  if (idx < 0) return null;
  const g = groups[idx];
  const p = spring({frame: frame - Math.round(g[0].start * fps), fps, config: {damping: 10, stiffness: 220}, durationInFrames: 8});
  return (
    <div style={{position: 'absolute', bottom: SAFE.bottom, left: SAFE.left, width: W - SAFE.left - SAFE.right,
      textAlign: 'center', transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: 'center bottom'}}>
      {g.map((w, i) => (
        <span key={i} style={{...outlinedText(fontSize * 0.18), fontSize, marginRight: '0.25em', display: 'inline-block',
          color: jauneSet.has(norm(w.text)) ? COLORS.jaune : COLORS.blanc,
          transform: t >= w.start && t < w.end ? 'scale(1.08)' : 'scale(1)'}}>
          {w.text}
        </span>
      ))}
    </div>
  );
};
export const SUBTITLE_ZONE_TOP = H - SAFE.bottom - 200;
