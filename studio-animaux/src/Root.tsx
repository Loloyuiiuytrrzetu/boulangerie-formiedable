import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './theme';
import {TestTechnique} from './TestTechnique';

export const Root: React.FC = () => (
  <>
    <Composition id="TestTechnique" component={TestTechnique} durationInFrames={FPS * 6} fps={FPS} width={W} height={H} />
    {/* Les épisodes sont enregistrés ici : <Composition id="ep-<slug>" ... /> */}
  </>
);
