import type { VisualStyle, VisualStyleConfig } from './types'

export const VISUAL_STYLES: Record<VisualStyle, VisualStyleConfig> = {
  cinematic: {
    bg: 'dark-gradient',
    card: 'floating',
    textAnim: 'fade-up',
    logo: 'corner',
    transition: 'crossfade',
  },
  bold: {
    bg: 'brand-color',
    card: 'fullscreen',
    textAnim: 'scale-in',
    logo: 'center',
    transition: 'slide-up',
  },
  clean: {
    bg: 'light-minimal',
    card: 'chat-bubble',
    textAnim: 'slide-left',
    logo: 'corner',
    transition: 'zoom',
  },
  editorial: {
    bg: 'split',
    card: 'overlay',
    textAnim: 'typewriter',
    logo: 'none',
    transition: 'wipe',
  },
}

export function getBgColors(
  style: VisualStyleConfig['bg'],
  brandColor: string,
  brandSecondaryColor: string,
  industry: string
): { top: string; bottom: string; text: string; accent: string } {
  const industryDark: Record<string, { top: string; bottom: string }> = {
    dental: { top: '#080f1e', bottom: '#0c1830' },
    clinic: { top: '#080f1e', bottom: '#0c1830' },
    restaurant: { top: '#160c06', bottom: '#2a1812' },
    gym: { top: '#060606', bottom: '#0f0f0f' },
    salon: { top: '#0a0608', bottom: '#180b14' },
    spa: { top: '#080c10', bottom: '#0c1018' },
  }
  const dark = industryDark[industry] ?? { top: '#0a0a0f', bottom: '#14141f' }

  switch (style) {
    case 'dark-gradient':
      return { top: dark.top, bottom: dark.bottom, text: '#ffffff', accent: brandColor }
    case 'brand-color':
      return { top: brandColor, bottom: brandSecondaryColor || shiftColor(brandColor, -30), text: '#ffffff', accent: '#ffffff' }
    case 'light-minimal':
      return { top: '#f8f9fc', bottom: '#eef1f7', text: '#1a1a2e', accent: brandColor }
    case 'split':
      return { top: '#0d0d14', bottom: brandColor, text: '#ffffff', accent: brandSecondaryColor || '#ffffff' }
  }
}

function shiftColor(hex: string, amount: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i)
  if (!m) return hex
  const r = Math.max(0, Math.min(255, parseInt(m[1].slice(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(m[1].slice(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(m[1].slice(4, 6), 16) + amount))
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}
