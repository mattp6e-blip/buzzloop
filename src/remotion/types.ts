import type { ReelScript } from '@/types'

export type VisualTemplate = 'immersive' | 'collage' | 'editorial'

export interface ReelVariation {
  id: number
  label: string           // "Story", "Proof", "Bold"
  description: string     // "Emotional arc · most shared"
  tone: 'story' | 'proof' | 'bold'
  hookHeadline: string
  hookSubline?: string
  ctaHeadline: string     // line 1: story callback
  ctaText: string         // line 2: friction reduction + action
  template: VisualTemplate
  script: ReelScript
  hookPhoto?: string | null   // specific photo for hook slide
  ctaPhoto?: string | null    // specific photo for CTA slide
}

export interface ReelCompositionProps {
  script: ReelScript
  variation: ReelVariation
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  businessName: string
  industry: string
  websiteUrl: string | null
  gbpPhotos: string[]     // full pool — used as fallback only
}
