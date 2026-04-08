import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { ReelComposition, REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from './ReelComposition'
import type { ReelCompositionProps } from './types'

function RemotionRoot() {
  return (
    <Composition
      id="Reel"
      component={ReelComposition as React.ComponentType<Record<string, unknown>>}
      fps={REEL_FPS}
      width={REEL_WIDTH}
      height={REEL_HEIGHT}
      durationInFrames={600}
      defaultProps={{} as ReelCompositionProps}
    />
  )
}

registerRoot(RemotionRoot)
