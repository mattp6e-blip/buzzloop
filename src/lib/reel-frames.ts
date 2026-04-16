/**
 * Computes the correct Remotion durationInFrames for a reel, accounting for
 * TransitionSeries overlaps. Each transition in ReelCompositionV2 subtracts
 * frames from the total rather than adding them.
 */

type SlideType = 'hook' | 'quote' | 'insight' | 'proof' | 'cta'

function transitionFrames(prevType: SlideType, currType: SlideType): number {
  if (currType === 'cta') return 28
  if (prevType === 'hook' && currType === 'quote') return 26
  if (currType === 'insight') return 22
  if (currType === 'proof') return 22
  return 22 // default fade
}

export function computeReelFrames(
  slides: { type: string; duration: number }[],
  fps: number,
): number {
  let total = 0
  for (let i = 0; i < slides.length; i++) {
    total += Math.round(slides[i].duration * fps)
    if (i > 0) {
      total -= transitionFrames(slides[i - 1].type as SlideType, slides[i].type as SlideType)
    }
  }
  return total
}
