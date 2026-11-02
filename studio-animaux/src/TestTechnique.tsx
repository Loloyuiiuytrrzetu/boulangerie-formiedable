import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimatedTitle} from './components/AnimatedTitle';
import {Subtitles} from './components/Subtitles';
import {Camera, ParallaxLayer} from './components/Camera';

// Test TECHNIQUE de la chaîne (titre, sous-titres, parallaxe, export). Pas un test de style des animaux.
const mots = 'Pourquoi ce test existe ? Pour vérifier le titre, les sous-titres et la profondeur.'
  .split(' ').map((text, i) => ({text, start: 1 + i * 0.32, end: 1 + i * 0.32 + 0.28}));

export const TestTechnique: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#7ec8f0, #d9f2ff)'}}>
    <Camera from={{x: 0, y: 0, zoom: 1}} to={{x: 40, y: 20, zoom: 1.12}}>
      <ParallaxLayer depth={0}><svg width="1400" height="1920"><path d="M0 1100 Q350 850 700 1050 T1400 1000 V1920 H0Z" fill="#8fbf8a"/></svg></ParallaxLayer>
      <ParallaxLayer depth={0.5}><svg width="1400" height="1920"><path d="M0 1300 Q400 1150 800 1280 T1400 1250 V1920 H0Z" fill="#5c9a5a"/></svg></ParallaxLayer>
      <ParallaxLayer depth={1}><svg width="1400" height="1920"><path d="M0 1550 Q500 1450 1000 1560 T1400 1520 V1920 H0Z" fill="#3b6e3d"/></svg></ParallaxLayer>
    </Camera>
    <AnimatedTitle segments={[{text: 'Pourquoi', at: 0.1}, {text: 'ce test', at: 0.5, highlight: true}, {text: 'existe ?', at: 0.9}]} />
    <Subtitles words={mots} jaunes={['titre', 'profondeur']} />
  </AbsoluteFill>
);
