import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import type { VisualStyleConfig } from '../types'

interface BgProps {
  bgStyle: VisualStyleConfig['bg']
  top: string
  bottom: string
  accent: string
  industry: string
}

export function Background({ bgStyle, top, bottom, accent, industry }: BgProps) {
  const frame = useCurrentFrame()

  if (bgStyle === 'dark-gradient' || bgStyle === 'brand-color') {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${top} 0%, ${bottom} 100%)` }}>
        <IndustryMotif industry={industry} accent={accent} />
        <VignetteOverlay />
      </AbsoluteFill>
    )
  }

  if (bgStyle === 'light-minimal') {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${top} 0%, ${bottom} 100%)` }}>
        <SubtleGrid accent={accent} />
      </AbsoluteFill>
    )
  }

  if (bgStyle === 'split') {
    const splitY = interpolate(frame, [0, 30], [45, 42], { extrapolateRight: 'clamp' })
    return (
      <AbsoluteFill>
        <div style={{ position: 'absolute', inset: 0, background: top }} />
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          height: `${100 - splitY}%`,
          background: bottom,
          borderRadius: '48px 48px 0 0',
        }} />
        <IndustryMotif industry={industry} accent={accent} />
      </AbsoluteFill>
    )
  }

  return <AbsoluteFill style={{ background: top }} />
}

function IndustryMotif({ industry, accent }: { industry: string; accent: string }) {
  const a = accent + '08'
  if (industry === 'dental' || industry === 'clinic') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <circle cx="540" cy="300" r="420" fill="none" stroke={a} strokeWidth="80" />
        <circle cx="540" cy="300" r="620" fill="none" stroke={a} strokeWidth="40" />
        <line x1="400" y1="200" x2="400" y2="400" stroke={a} strokeWidth="30" strokeLinecap="round" />
        <line x1="300" y1="300" x2="500" y2="300" stroke={a} strokeWidth="30" strokeLinecap="round" />
      </svg>
    )
  }
  if (industry === 'restaurant') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <path d="M200 0 Q400 300 200 600 Q0 900 200 1200" fill="none" stroke={a} strokeWidth="60" />
        <path d="M880 300 Q680 600 880 900 Q1080 1200 880 1500" fill="none" stroke={a} strokeWidth="40" />
      </svg>
    )
  }
  if (industry === 'gym') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <line x1="-100" y1="500" x2="1180" y2="0" stroke={a} strokeWidth="120" />
        <line x1="-100" y1="900" x2="1180" y2="400" stroke={a} strokeWidth="60" />
        <line x1="-100" y1="1300" x2="1180" y2="800" stroke={a} strokeWidth="30" />
      </svg>
    )
  }
  if (industry === 'salon' || industry === 'spa') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <path d="M0 400 Q270 200 540 400 Q810 600 1080 400" fill="none" stroke={a} strokeWidth="50" />
        <path d="M0 800 Q270 600 540 800 Q810 1000 1080 800" fill="none" stroke={a} strokeWidth="30" />
        <path d="M0 1200 Q270 1000 540 1200 Q810 1400 1080 1200" fill="none" stroke={a} strokeWidth="20" />
      </svg>
    )
  }
  return null
}

function VignetteOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
    }} />
  )
}

function SubtleGrid({ accent }: { accent: string }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `linear-gradient(${accent}18 1px, transparent 1px), linear-gradient(90deg, ${accent}18 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
    }} />
  )
}
