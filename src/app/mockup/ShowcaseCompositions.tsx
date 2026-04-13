import { AbsoluteFill } from 'remotion'
import { ReelComposition } from '@/remotion/ReelComposition'
import { DuotoneLayer } from '@/remotion/components/DuotoneLayer'
import { ColorGrade } from '@/remotion/components/ColorGrade'
import type { ReelCompositionProps } from '@/remotion/types'
import type { VisualTemplate } from '@/remotion/types'

// ── Palette helpers ───────────────────────────────────────────────────────────

interface Palette {
  hook: VisualTemplate
  quote: VisualTemplate
  proof: VisualTemplate
  insight: VisualTemplate
  cta: VisualTemplate
}

function applyPalette(props: ReelCompositionProps, p: Palette): ReelCompositionProps {
  return {
    ...props,
    script: {
      ...props.script,
      slides: props.script.slides.map(slide => ({
        ...slide,
        content: {
          ...slide.content,
          template: p[slide.type as keyof Palette] ?? 'immersive',
        },
      })),
    },
  }
}

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

// ── Template compositions ─────────────────────────────────────────────────────

export function CompositionSplit(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'split' as const }} />
}

export function CompositionMinimal(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'minimal' as const }} />
}

export function CompositionGradient(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'gradient' as const }} />
}

export function CompositionCinematic(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'cinematic' as const }} />
}

export function CompositionNeon(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'neon' as const }} />
}

export function CompositionBold(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'bold' as const }} />
}

export function CompositionCards(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'cards' as const }} />
}

export function CompositionHeadline(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'headline' as const }} />
}

export function CompositionOverlay(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'overlay' as const }} />
}

export function CompositionBrand(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, template: 'brand' as const }} />
}

// ── Motif showcases ──────────────────────────────────────────────────────────
// Each injects a different motif into the variation to demo background animations.

export function CompositionMotifParticles(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'particles' }} />
}

export function CompositionMotifAurora(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'aurora' }} />
}

export function CompositionMotifLightRays(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'light_rays' }} />
}

export function CompositionMotifRadialBurst(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'radial_burst' }} />
}

export function CompositionMotifConfetti(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'confetti' }} />
}

export function CompositionMotifStarsFill(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'stars_fill' }} />
}

export function CompositionMotifProgressRing(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'progress_ring', motifValue: 127 }} />
}

export function CompositionMotifRocketLaunch(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'rocket_launch' }} />
}

export function CompositionMotifBarChart(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'bar_chart_rise' }} />
}

export function CompositionMotifGoogleG(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'google_g' }} />
}

export function CompositionMotifChatBubbles(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'chat_bubbles' }} />
}

export function CompositionMotifRippleWaves(props: ReelCompositionProps) {
  return <ReelComposition {...props} variation={{ ...props.variation, motif: 'ripple_waves' }} />
}

// ── Palette showcases ─────────────────────────────────────────────────────────
// Each palette is a curated slide-by-slide template combination.
// hook / quote / proof / insight / cta

// 1. Dark Cinematic — photo-driven, cinematic transitions
export function CompositionPaletteDarkCinematic(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'cinematic', quote: 'overlay', proof: 'minimal', insight: 'gradient', cta: 'brand' })} />
}

// 2. Bold Energy — maximum punch and glow
export function CompositionPaletteBoldEnergy(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'bold', quote: 'neon', proof: 'gradient', insight: 'neon', cta: 'brand' })} />
}

// 3. Magazine Light — editorial light mode throughout
export function CompositionPaletteMagazineLight(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'headline', quote: 'headline', proof: 'split', insight: 'editorial', cta: 'bold' })} />
}

// 4. Brand Forward — brand colour is the hero
export function CompositionPaletteBrandForward(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'gradient', quote: 'cards', proof: 'minimal', insight: 'gradient', cta: 'brand' })} />
}

// 5. Neon Pulse — full neon, high contrast dark
export function CompositionPaletteNeonPulse(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'neon', quote: 'neon', proof: 'minimal', insight: 'neon', cta: 'gradient' })} />
}

// 6. Pure Type — pure typography, zero decoration
export function CompositionPalettePureType(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'minimal', quote: 'minimal', proof: 'minimal', insight: 'minimal', cta: 'brand' })} />
}

// 9. Cards All Day — review card UI throughout
export function CompositionPaletteCardsAllDay(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'cards', quote: 'cards', proof: 'minimal', insight: 'cards', cta: 'brand' })} />
}

// 10. Editorial Mix — editorial dark with light quotes
export function CompositionPaletteEditorialMix(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'editorial', quote: 'headline', proof: 'minimal', insight: 'editorial', cta: 'gradient' })} />
}

// 11. Cinematic Cards — film hook, card quotes
export function CompositionPaletteCinematicCards(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'cinematic', quote: 'cards', proof: 'minimal', insight: 'gradient', cta: 'brand' })} />
}

// 10. Immersive Overlay — photo-first, glass quote panels
export function CompositionPaletteImmersiveOverlay(props: ReelCompositionProps) {
  return <ReelComposition {...applyPalette(props, { hook: 'immersive', quote: 'overlay', proof: 'minimal', insight: 'cinematic', cta: 'brand' })} />
}
