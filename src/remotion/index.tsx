import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { ReelComposition, REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from './ReelComposition'
import type { ReelCompositionProps } from './types'

function RemotionRoot() {
  return (
    <Composition
      id="Reel"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={ReelComposition as any}
      fps={REEL_FPS}
      width={REEL_WIDTH}
      height={REEL_HEIGHT}
      durationInFrames={600}
      defaultProps={{} as ReelCompositionProps}
    />
  )
}

registerRoot(RemotionRoot)
