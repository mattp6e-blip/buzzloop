import type { VisualTemplate } from './types'

// Dark background colors per industry — brand color is always the accent
const INDUSTRY_DARK: Record<string, { top: string; bottom: string }> = {
  dental:        { top: '#080f1e', bottom: '#0c1830' },
  clinic:        { top: '#080f1e', bottom: '#0c1830' },
  restaurant:    { top: '#160c06', bottom: '#2a1812' },
  gym:           { top: '#060606', bottom: '#0f0f0f' },
  salon:         { top: '#0a0608', bottom: '#180b14' },
  spa:           { top: '#080c10', bottom: '#0c1018' },
  hotel:         { top: '#08080f', bottom: '#12121e' },
  bar:           { top: '#0c0606', bottom: '#1a0a0a' },
  physiotherapy: { top: '#060d12', bottom: '#0c1820' },
  veterinary:    { top: '#060c08', bottom: '#0c1810' },
}

export function getDarkColors(industry: string): { top: string; bottom: string } {
  return INDUSTRY_DARK[industry] ?? { top: '#0a0a0f', bottom: '#14141f' }
}

// Template metadata
export const TEMPLATE_CONFIGS: Record<VisualTemplate, {
  textAnim: 'fade-up' | 'scale-in' | 'slam'
  logo: 'corner' | 'center' | 'none'
}> = {
  immersive: { textAnim: 'slam', logo: 'corner' },
  editorial: { textAnim: 'scale-in', logo: 'none' },
}

function shiftColor(hex: string, amount: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i)
  if (!m) return hex
  const r = Math.max(0, Math.min(255, parseInt(m[1].slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(m[1].slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(m[1].slice(4, 6), 16) + amount))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function getBrandGradient(brandColor: string, brandSecondaryColor: string): { top: string; bottom: string } {
  return {
    top: brandColor,
    bottom: brandSecondaryColor || shiftColor(brandColor, -30),
  }
}
