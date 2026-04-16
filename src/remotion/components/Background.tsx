import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { getDarkColors } from '../styleConfigs'

interface BgProps {
  brandColor: string
  industry: string
}

export function Background({ brandColor, industry }: BgProps) {
  const frame = useCurrentFrame()
  const { top, bottom } = getDarkColors(industry)

  // Slow organic drift — one full cycle every 4 seconds at 30fps
  const t = frame / 120
  const orb1X = 22 + Math.sin(t * Math.PI * 2) * 9
  const orb1Y = 20 + Math.cos(t * Math.PI * 2) * 7
  const orb2X = 72 + Math.sin(t * Math.PI * 2 + 1.8) * 11
  const orb2Y = 68 + Math.cos(t * Math.PI * 2 + 1.8) * 9

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${top} 0%, ${bottom} 100%)` }}>
      {/* Drifting ambient orb 1 — warm brand glow */}
      <div style={{
        position: 'absolute',
        left: `${orb1X}%`,
        top: `${orb1Y}%`,
        width: 700,
        height: 700,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(ellipse, ${brandColor}2e 0%, transparent 68%)`,
        filter: 'blur(48px)',
        pointerEvents: 'none',
      }} />
      {/* Drifting ambient orb 2 — cooler secondary glow */}
      <div style={{
        position: 'absolute',
        left: `${orb2X}%`,
        top: `${orb2Y}%`,
        width: 560,
        height: 560,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(ellipse, ${brandColor}1a 0%, transparent 70%)`,
        filter: 'blur(64px)',
        pointerEvents: 'none',
      }} />
      <IndustryMotif industry={industry} accent={brandColor} />
      <VignetteOverlay />
    </AbsoluteFill>
  )
}

function IndustryMotif({ industry, accent }: { industry: string; accent: string }) {
  const a = accent + '08'
  if (industry === 'dental' || industry === 'clinic') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <circle cx="540" cy="300" r="420" fill="none" stroke={a} strokeWidth="80" />
        <circle cx="540" cy="300" r="620" fill="none" stroke={a} strokeWidth="40" />
      </svg>
    )
  }
  if (industry === 'restaurant' || industry === 'bar') {
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
      </svg>
    )
  }
  if (industry === 'salon' || industry === 'spa') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
        <path d="M0 400 Q270 200 540 400 Q810 600 1080 400" fill="none" stroke={a} strokeWidth="50" />
        <path d="M0 800 Q270 600 540 800 Q810 1000 1080 800" fill="none" stroke={a} strokeWidth="30" />
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
