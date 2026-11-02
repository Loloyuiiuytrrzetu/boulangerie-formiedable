import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CameraKey} from '../types';

// Caméra virtuelle : interpole position/zoom entre deux clés sur la durée de la séquence.
export const Camera: React.FC<{from: CameraKey; to: CameraKey; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const k = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const x = from.x + (to.x - from.x) * k, y = from.y + (to.y - from.y) * k, z = from.zoom + (to.zoom - from.zoom) * k;
  return <div style={{position: 'absolute', inset: 0, transform: `scale(${z}) translate(${-x}px, ${-y}px)`, transformOrigin: 'center'}}>{children}</div>;
};

// Couche de parallaxe : depth 0 = horizon lointain (bouge peu), 1 = premier plan (bouge beaucoup).
export const ParallaxLayer: React.FC<{depth: number; driftX?: number; children: React.ReactNode}> = ({depth, driftX = 120, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const dx = interpolate(frame, [0, durationInFrames], [0, -driftX * (0.15 + depth)]);
  return <div style={{position: 'absolute', inset: 0, transform: `translateX(${dx}px) scale(${1 + depth * 0.05})`}}>{children}</div>;
};
