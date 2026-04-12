import { AbsoluteFill } from 'remotion'
import { ReelComposition } from '@/remotion/ReelComposition'
import { DuotoneLayer } from '@/remotion/components/DuotoneLayer'
import { ColorGrade } from '@/remotion/components/ColorGrade'
import type { ReelCompositionProps } from '@/remotion/types'

// Original — no change, just re-exported for uniform API
export function CompositionOriginal(props: ReelCompositionProps) {
  return <ReelComposition {...props} />
}

// Brand duotone: multiply-blends the brand color over all photos
export function CompositionDuotone(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <DuotoneLayer color={props.brandColor} opacity={0.42} />
    </AbsoluteFill>
  )
}

// Warm cinematic grade: golden orange overlay
export function CompositionWarm(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <ColorGrade preset="warm" />
    </AbsoluteFill>
  )
}

// Cool cinematic grade: blue-teal overlay
export function CompositionCool(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <ColorGrade preset="cool" />
    </AbsoluteFill>
  )
}

// Rose/purple grade: romantic, beauty-industry feel
export function CompositionRose(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <ColorGrade preset="rose" />
    </AbsoluteFill>
  )
}

// Teal + orange split grade: cinematic complementary
export function CompositionTealOrange(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <ColorGrade preset="teal_orange" />
    </AbsoluteFill>
  )
}

// Noir: heavy vignette, extra dark
export function CompositionNoir(props: ReelCompositionProps) {
  return (
    <AbsoluteFill>
      <ReelComposition {...props} />
      <ColorGrade preset="noir" intensity={1.4} />
    </AbsoluteFill>
  )
}

// Editorial template: text-dominant, no photos
export function CompositionEditorial(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'editorial' as const }} />
}

// Alternative brand: purple (#a855f7)
export function CompositionPurple(props: ReelCompositionProps) {
  return <ReelComposition {...props} brandColor="#a855f7" brandSecondaryColor="#a855f7" />
}

// Alternative brand: coral/orange (#f97316)
export function CompositionCoral(props: ReelCompositionProps) {
  return <ReelComposition {...props} brandColor="#f97316" brandSecondaryColor="#f97316" />
}

// Alternative brand: emerald (#10b981)
export function CompositionEmerald(props: ReelCompositionProps) {
  return <ReelComposition {...props} brandColor="#10b981" brandSecondaryColor="#10b981" />
}

// Alternative brand: rose (#f43f5e)
export function CompositionRoseBrand(props: ReelCompositionProps) {
  return <ReelComposition {...props} brandColor="#f43f5e" brandSecondaryColor="#f43f5e" />
}
