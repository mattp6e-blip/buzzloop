import type { ReelScript } from '@/types'

export type VisualStyle = 'cinematic' | 'bold' | 'clean' | 'editorial'

export interface VisualStyleConfig {
  bg: 'dark-gradient' | 'brand-color' | 'light-minimal' | 'split'
  card: 'floating' | 'fullscreen' | 'chat-bubble' | 'overlay'
  textAnim: 'fade-up' | 'scale-in' | 'slide-left' | 'typewriter'
  logo: 'corner' | 'center' | 'none'
  transition: 'crossfade' | 'slide-up' | 'zoom' | 'wipe'
}

export interface ReelVariation {
  id: number
  label: string           // "Story", "Bold", "Authority"
  description: string     // "Emotional arc · most shared"
  tone: 'story' | 'bold' | 'authority'
  hookHeadline: string
  hookSubline?: string
  ctaText: string
  visualStyle: VisualStyle
  script: ReelScript      // each variation has its own independently generated script
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
}
