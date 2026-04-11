import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

// ── Type ──────────────────────────────────────────────────────────────────────

export type ReelMotif =
  // Journey & Distance
  | 'flight_path' | 'radius_expand' | 'map_zoom'
  // Time & Loyalty
  | 'counter_up' | 'streak_line' | 'years_timeline'
  // Numbers & Proof
  | 'stars_fill' | 'crowd_fill' | 'progress_ring'
  // Transform / Contrast
  | 'split_screen' | 'scale_tip'
  // Process & Education
  | 'steps_reveal' | 'checklist'
  // Energy & Emotion
  | 'radial_burst' | 'heartbeat' | 'confetti' | 'ripple_waves'
  // Location
  | 'pin_drop' | 'city_skyline'
  // Atmosphere
  | 'particles' | 'light_rays' | 'aurora'
  // People
  | 'dots_fill'
  // Typography
  | 'neon_glow'
  // Industry icons
  | 'icon_tooth' | 'icon_dumbbell' | 'icon_fork_knife' | 'icon_cocktail'
  | 'icon_scissors' | 'icon_paw' | 'icon_scales' | 'icon_eye'
  | 'icon_chef_hat' | 'icon_hotel_bed' | 'icon_needle' | 'icon_camera'
  // Brand & proof
  | 'google_g' | 'calendar_fill' | 'phone_frame' | 'trophy'
  | 'none'

// ── MotifLayer ────────────────────────────────────────────────────────────────

export function MotifLayer({ motif, brandColor, value }: {
  motif?: ReelMotif
  brandColor: string
  value?: number   // for counter_up, progress_ring
}) {
  if (!motif || motif === 'none') return null
  const p = { brandColor, value }
  switch (motif) {
    case 'flight_path':    return <FlightPath {...p} />
    case 'radius_expand':  return <RadiusExpand {...p} />
    case 'map_zoom':       return <MapZoom {...p} />
    case 'counter_up':     return <CounterUp {...p} />
    case 'streak_line':    return <StreakLine {...p} />
    case 'years_timeline': return <YearsTimeline {...p} />
    case 'stars_fill':     return <StarsFill {...p} />
    case 'crowd_fill':     return <CrowdFill {...p} />
    case 'progress_ring':  return <ProgressRing {...p} />
    case 'split_screen':   return <SplitScreen {...p} />
    case 'scale_tip':      return <ScaleTip {...p} />
    case 'steps_reveal':   return <StepsReveal {...p} />
    case 'checklist':      return <Checklist {...p} />
    case 'radial_burst':   return <RadialBurst {...p} />
    case 'heartbeat':      return <Heartbeat {...p} />
    case 'confetti':       return <Confetti {...p} />
    case 'ripple_waves':   return <RippleWaves {...p} />
    case 'pin_drop':       return <PinDrop {...p} />
    case 'city_skyline':   return <CitySkyline {...p} />
    case 'particles':      return <Particles {...p} />
    case 'light_rays':     return <LightRays {...p} />
    case 'aurora':         return <Aurora {...p} />
    case 'dots_fill':      return <DotsFill {...p} />
    case 'neon_glow':      return <NeonGlow {...p} />
    case 'icon_tooth':     return <IconMotif brandColor={brandColor} emoji="🦷" />
    case 'icon_dumbbell':  return <IconMotif brandColor={brandColor} emoji="🏋️" />
    case 'icon_fork_knife':return <IconMotif brandColor={brandColor} emoji="🍽️" />
    case 'icon_cocktail':  return <IconMotif brandColor={brandColor} emoji="🍸" />
    case 'icon_scissors':  return <IconMotif brandColor={brandColor} emoji="✂️" />
    case 'icon_paw':       return <IconMotif brandColor={brandColor} emoji="🐾" />
    case 'icon_scales':    return <IconMotif brandColor={brandColor} emoji="⚖️" />
    case 'icon_eye':       return <IconMotif brandColor={brandColor} emoji="👁️" />
    case 'icon_chef_hat':  return <IconMotif brandColor={brandColor} emoji="👨‍🍳" />
    case 'icon_hotel_bed': return <IconMotif brandColor={brandColor} emoji="🛏️" />
    case 'icon_needle':    return <IconMotif brandColor={brandColor} emoji="🎨" />
    case 'icon_camera':    return <IconMotif brandColor={brandColor} emoji="📷" />
    case 'google_g':       return <GoogleG brandColor={brandColor} />
    case 'calendar_fill':  return <CalendarFill brandColor={brandColor} />
    case 'phone_frame':    return <PhoneFrame brandColor={brandColor} />
    case 'trophy':         return <Trophy brandColor={brandColor} />
    default:               return null
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

function fi(frame: number, a = 0, b = 8) {
  return interpolate(frame, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
}

// ── Journey & Distance ────────────────────────────────────────────────────────

function FlightPath({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.7

  // Quadratic bezier: left-mid → arc up through centre → right-mid
  const sx = 80, sy = 1050, cx = 540, cy = 300, ex = 1000, ey = 1050
  const N = 42
  const dots = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1)
    const x = (1-t)*(1-t)*sx + 2*(1-t)*t*cx + t*t*ex
    const y = (1-t)*(1-t)*sy + 2*(1-t)*t*cy + t*t*ey
    const ap = fi(frame, t * durationInFrames * 0.65, t * durationInFrames * 0.65 + 7)
    return { x, y, ap, big: i === 0 || i === N - 1 }
  })

  const pt = interpolate(frame, [8, durationInFrames * 0.78], [0, 1], { extrapolateRight: 'clamp' })
  const px = (1-pt)*(1-pt)*sx + 2*(1-pt)*pt*cx + pt*pt*ex
  const py = (1-pt)*(1-pt)*sy + 2*(1-pt)*pt*cy + pt*pt*ey
  const t2 = Math.min(pt + 0.01, 1)
  const nx = (1-t2)*(1-t2)*sx + 2*(1-t2)*t2*cx + t2*t2*ex
  const ny = (1-t2)*(1-t2)*sy + 2*(1-t2)*t2*cy + t2*t2*ey
  const angle = Math.atan2(ny - py, nx - px) * 180 / Math.PI

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.big ? 14 : 5}
            fill={brandColor} opacity={d.ap * (d.big ? 0.9 : 0.55)} />
        ))}
      </svg>
      {pt > 0.02 && (
        <div style={{
          position: 'absolute', left: px, top: py, fontSize: 56,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          filter: `drop-shadow(0 0 20px ${brandColor}90)`,
          lineHeight: 1,
        }}>✈️</div>
      )}
    </AbsoluteFill>
  )
}

function RadiusExpand({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.4
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0, 0.18, 0.36].map((delay, i) => {
          const sp = spring({ frame: Math.max(0, frame - delay * durationInFrames), fps, config: { stiffness: 25, damping: 18 } })
          const r = interpolate(sp, [0, 1], [0, 680])
          const op = interpolate(sp, [0, 0.25, 1], [0, 0.65, 0])
          return <circle key={i} cx={540} cy={800} r={r} stroke={brandColor} strokeWidth={2.5} fill="none" opacity={op} />
        })}
        <circle cx={540} cy={800} r={fi(frame, 0, 10) * 18} fill={brandColor} opacity={0.85} />
      </svg>
    </AbsoluteFill>
  )
}

function MapZoom({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.5
  const sp = spring({ frame, fps, config: { stiffness: 35, damping: 20 } })
  const scale = interpolate(sp, [0, 1], [3, 1])

  // Simple grid of lines suggesting a map
  const gridLines = [200, 400, 600, 800, 1000]
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: '540px 700px' }}>
        {gridLines.map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={1920} stroke={brandColor} strokeWidth={1} opacity={0.18} />)}
        {[200, 400, 600, 800, 1000, 1200, 1400, 1600].map(y => <line key={`h${y}`} x1={0} y1={y} x2={1080} y2={y} stroke={brandColor} strokeWidth={1} opacity={0.18} />)}
        <circle cx={540} cy={700} r={40} fill={brandColor} opacity={0.7} />
        <circle cx={540} cy={700} r={70} stroke={brandColor} strokeWidth={3} fill="none" opacity={0.4} />
      </svg>
    </AbsoluteFill>
  )
}

// ── Time & Loyalty ────────────────────────────────────────────────────────────

function CounterUp({ brandColor, value = 100 }: { brandColor: string; value?: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sp = spring({ frame, fps, config: { stiffness: 28, damping: 18 } })
  const count = Math.round(interpolate(sp, [0, 1], [0, value]))
  const opacity = fi(frame, 0, 18) * 0.28
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', opacity }}>
      <div style={{
        fontSize: 420, fontWeight: 900, color: brandColor,
        letterSpacing: '-0.06em', lineHeight: 1, userSelect: 'none',
      }}>{count}</div>
    </AbsoluteFill>
  )
}

function StreakLine({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.65
  const progress = interpolate(frame, [6, durationInFrames * 0.72], [0, 1], { extrapolateRight: 'clamp' })
  const N = 14
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1={80} y1={420} x2={80 + progress * 920} y2={420}
          stroke={brandColor} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        {Array.from({ length: N }, (_, i) => {
          const x = 80 + (i / (N - 1)) * 920
          const shown = (i / N) < progress
          return (
            <circle key={i} cx={x} cy={420} r={i === N - 1 ? 14 : 7}
              fill={i === N - 1 ? brandColor : 'none'}
              stroke={brandColor} strokeWidth={2}
              opacity={shown ? (i === N - 1 ? 1 : 0.6) : 0} />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

function YearsTimeline({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.55
  const milestones = ['Day 1', '6 months', '1 year', '5 years', 'Today']
  const lineProgress = interpolate(frame, [5, durationInFrames * 0.78], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1={160} y1={280} x2={160} y2={280 + lineProgress * 880}
          stroke={brandColor} strokeWidth={2} opacity={0.55} />
        {milestones.map((label, i) => {
          const y = 280 + (i / (milestones.length - 1)) * 880
          const ap = (i / milestones.length) < lineProgress
            ? fi(frame, (i / milestones.length) * durationInFrames * 0.78, (i / milestones.length) * durationInFrames * 0.78 + 9)
            : 0
          const isLast = i === milestones.length - 1
          return (
            <g key={i} opacity={ap}>
              <circle cx={160} cy={y} r={isLast ? 16 : 10}
                fill={isLast ? brandColor : 'none'}
                stroke={brandColor} strokeWidth={2} />
              <text x={200} y={y + 9} fill="rgba(255,255,255,0.5)" fontSize={26}>{label}</text>
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ── Numbers & Proof ───────────────────────────────────────────────────────────

function StarsFill({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame)
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{
        position: 'absolute', top: 260, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 18,
      }}>
        {[0, 1, 2, 3, 4].map(i => {
          const so = fi(frame, i * 5 + 2, i * 5 + 14)
          const ss = interpolate(frame, [i * 5 + 2, i * 5 + 20], [0.4, 1], { extrapolateRight: 'clamp' })
          return (
            <div key={i} style={{
              fontSize: 88, color: brandColor, opacity: so,
              transform: `scale(${ss})`, display: 'inline-block',
              filter: `drop-shadow(0 0 24px ${brandColor}90)`,
            }}>★</div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

function CrowdFill({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.62
  const cols = 14, rows = 7
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: cols * rows }, (_, idx) => {
          const col = idx % cols, row = Math.floor(idx / cols)
          const x = 65 + col * 71, y = 210 + row * 90
          const delay = (row / rows) * durationInFrames * 0.55 + (col / cols) * 7
          const ap = fi(frame, delay, delay + 9)
          return <circle key={idx} cx={x} cy={y} r={14} fill={brandColor} opacity={ap} />
        })}
      </svg>
    </AbsoluteFill>
  )
}

function ProgressRing({ brandColor, value = 100 }: { brandColor: string; value?: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.55
  const sp = spring({ frame, fps, config: { stiffness: 30, damping: 20 } })
  const pct = interpolate(sp, [0, 1], [0, (value ?? 100) / 100])
  const r = 300, circ = 2 * Math.PI * r
  const dashOffset = circ * (1 - pct)
  const num = Math.round(pct * (value ?? 100))
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <circle cx={540} cy={760} r={r} stroke={`${brandColor}22`} strokeWidth={9} fill="none" />
        <circle cx={540} cy={760} r={r} stroke={brandColor} strokeWidth={9} fill="none"
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform="rotate(-90 540 760)" opacity={0.75} />
        <text x={540} y={785} textAnchor="middle"
          fill="white" fontSize={90} fontWeight={900} opacity={0.11}>
          {num}{value === 100 ? '%' : ''}
        </text>
      </svg>
    </AbsoluteFill>
  )
}

// ── Transform / Contrast ──────────────────────────────────────────────────────

function SplitScreen({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const lineOp = fi(frame, 6, 22)
  return (
    <AbsoluteFill style={{ opacity: fi(frame) * 0.7 }}>
      <div style={{ position: 'absolute', inset: 0, left: 0, width: '50%', background: 'rgba(239,68,68,0.07)' }} />
      <div style={{ position: 'absolute', inset: 0, left: '50%', width: '50%', background: `${brandColor}10` }} />
      <div style={{
        position: 'absolute', left: '50%', top: 0, width: 2, height: '100%',
        background: `linear-gradient(to bottom, transparent, ${brandColor}70, transparent)`,
        opacity: lineOp,
      }} />
      <div style={{ position: 'absolute', top: 210, left: 80, fontSize: 26, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(239,68,68,0.65)', opacity: lineOp }}>MYTH</div>
      <div style={{ position: 'absolute', top: 210, right: 80, fontSize: 26, fontWeight: 700, letterSpacing: '0.22em', color: brandColor, opacity: lineOp }}>TRUTH</div>
    </AbsoluteFill>
  )
}

function ScaleTip({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.65
  const sp = spring({ frame, fps, config: { stiffness: 50, damping: 14 } })
  const tilt = interpolate(sp, [0, 1], [0, -18])
  const cx = 540, cy = 800, armLen = 320
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`rotate(${tilt} ${cx} ${cy})`}>
          <line x1={cx - armLen} y1={cy} x2={cx + armLen} y2={cy} stroke={brandColor} strokeWidth={4} opacity={0.7} />
          <circle cx={cx} cy={cy} r={12} fill={brandColor} opacity={0.8} />
          <line x1={cx} y1={cy - 80} x2={cx} y2={cy + 80} stroke={brandColor} strokeWidth={3} opacity={0.5} />
          {/* Left pan — heavier (drops) */}
          <path d={`M ${cx - armLen} ${cy} Q ${cx - armLen - 60} ${cy + 80} ${cx - armLen + 60} ${cy + 80} Z`} stroke={brandColor} strokeWidth={2} fill={`${brandColor}20`} opacity={0.7} />
          {/* Right pan */}
          <path d={`M ${cx + armLen} ${cy} Q ${cx + armLen - 60} ${cy + 30} ${cx + armLen + 60} ${cy + 30} Z`} stroke={brandColor} strokeWidth={2} fill={`${brandColor}20`} opacity={0.7} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// ── Process & Education ───────────────────────────────────────────────────────

function StepsReveal({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.6
  const N = 3
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: N }, (_, i) => {
          const sp = spring({ frame: Math.max(0, frame - i * 14), fps: 30, config: { stiffness: 90, damping: 14 } })
          const scale = interpolate(sp, [0, 1], [0.4, 1])
          const ap = interpolate(sp, [0, 0.35], [0, 1])
          const cx = 190 + i * 350, cy = 380
          const connOp = i > 0 ? fi(frame, i * 14 - 4, i * 14 + 8) : 0
          return (
            <g key={i}>
              {i > 0 && (
                <line x1={(190 + (i-1)*350) + 58} y1={cy} x2={cx - 58} y2={cy}
                  stroke={brandColor} strokeWidth={2} opacity={connOp * 0.45} strokeDasharray="10 7" />
              )}
              <circle cx={cx} cy={cy} r={58 * scale} fill={`${brandColor}28`} opacity={ap} />
              <circle cx={cx} cy={cy} r={58 * scale} stroke={brandColor} strokeWidth={3} fill="none" opacity={ap * 0.75} />
              <text x={cx} y={cy + 20} textAnchor="middle" fill={brandColor}
                fontSize={54} fontWeight={900} opacity={ap}>{i + 1}</text>
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

function Checklist({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.52
  const N = 4
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: N }, (_, i) => {
          const itemOp = fi(frame, i * 11 + 4, i * 11 + 18)
          const checkOp = fi(frame, i * 11 + 17, i * 11 + 28)
          const y = 290 + i * 145
          return (
            <g key={i} opacity={itemOp}>
              <rect x={80} y={y - 38} width={76} height={76} rx={14}
                stroke={brandColor} strokeWidth={3} fill={`${brandColor}18`} />
              <text x={118} y={y + 16} textAnchor="middle" fill={brandColor}
                fontSize={46} opacity={checkOp}>✓</text>
              <line x1={190} y1={y} x2={940} y2={y}
                stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ── Energy & Emotion ──────────────────────────────────────────────────────────

function RadialBurst({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.5
  const sp = spring({ frame, fps, config: { stiffness: 38, damping: 16 } })
  const len = interpolate(sp, [0, 1], [0, 440])
  const rot = interpolate(frame, [0, durationInFrames], [0, 22])
  const N = 28
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`rotate(${rot} 540 680)`}>
          {Array.from({ length: N }, (_, i) => {
            const angle = (i / N) * 360 * Math.PI / 180
            const x2 = 540 + Math.cos(angle) * len
            const y2 = 680 + Math.sin(angle) * len
            return (
              <line key={i} x1={540} y1={680} x2={x2} y2={y2}
                stroke={brandColor} strokeWidth={i % 3 === 0 ? 3.5 : 1.5}
                opacity={i % 2 === 0 ? 0.65 : 0.28} strokeLinecap="round" />
            )
          })}
          <circle cx={540} cy={680} r={22} fill={brandColor} opacity={0.85} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

function Heartbeat({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.75
  const progress = interpolate(frame, [4, durationInFrames * 0.82], [0, 1], { extrapolateRight: 'clamp' })

  const W = 940, baseX = 70, cy = 680
  // ECG waypoints: normalised x [0..1] → normalised y offset [-1..1]
  const pts: [number, number][] = [
    [0, 0], [0.14, 0], [0.2, -0.06], [0.26, 0],
    [0.3, 0], [0.36, -0.4], [0.42, 0.7], [0.46, -0.18], [0.52, 0],
    [0.56, 0], [0.7, 0], [0.76, -0.07], [0.82, 0], [1, 0],
  ]
  const mapped = pts.map(([px, py]) => ({ x: baseX + px * W, y: cy + py * 320 }))

  // Find current tip position for the glowing dot
  const tipIdx = Math.min(Math.floor(progress * (mapped.length - 1)), mapped.length - 2)
  const frac = progress * (mapped.length - 1) - tipIdx
  const tipX = mapped[tipIdx].x + frac * (mapped[tipIdx + 1].x - mapped[tipIdx].x)
  const tipY = mapped[tipIdx].y + frac * (mapped[tipIdx + 1].y - mapped[tipIdx].y)
  const clipW = progress * W

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id="hb-clip">
            <rect x={baseX} y={0} width={clipW} height={1920} />
          </clipPath>
        </defs>
        <polyline
          points={mapped.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke={brandColor} strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round"
          clipPath="url(#hb-clip)" opacity={0.8}
        />
        {progress > 0.04 && progress < 0.97 && (
          <>
            <circle cx={tipX} cy={tipY} r={18} fill={brandColor} opacity={0.95} />
            <circle cx={tipX} cy={tipY} r={32} fill={brandColor} opacity={0.25} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  )
}

function Confetti({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.72
  const items = Array.from({ length: 38 }, (_, i) => ({
    x: 70 + (i * 139) % 940,
    delay: (i * 5) % 32,
    size: 18 + (i * 9) % 28,
    speed: 0.7 + (i * 0.27) % 1.5,
    shape: i % 3,
    color: i % 5 === 0 ? brandColor
      : i % 5 === 1 ? 'rgba(255,255,255,0.75)'
      : i % 5 === 2 ? `${brandColor}bb`
      : i % 5 === 3 ? 'rgba(255,255,255,0.4)'
      : `${brandColor}66`,
  }))
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {items.map((item, i) => {
          const elapsed = Math.max(0, frame - item.delay)
          const y = (elapsed * item.speed * 1.8) % 2000 - 60
          const rot = elapsed * item.speed * 9
          const op = y < 0 || y > 1960 ? 0 : 0.9
          if (item.shape === 0) {
            return <rect key={i} x={item.x} y={y} width={item.size} height={item.size}
              fill={item.color} rx={3} opacity={op}
              transform={`rotate(${rot} ${item.x + item.size / 2} ${y + item.size / 2})`} />
          } else if (item.shape === 1) {
            return <circle key={i} cx={item.x} cy={y} r={item.size / 2} fill={item.color} opacity={op} />
          } else {
            const s = item.size
            return <polygon key={i} fill={item.color} opacity={op}
              points={`${item.x},${y - s} ${item.x + s},${y + s} ${item.x - s},${y + s}`}
              transform={`rotate(${rot} ${item.x} ${y})`} />
          }
        })}
      </svg>
    </AbsoluteFill>
  )
}

function RippleWaves({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.48
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[0, 22, 44].map((delay, i) => {
          const sp = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 18, damping: 16 } })
          const r = interpolate(sp, [0, 1], [0, 820])
          const op = interpolate(sp, [0, 0.18, 1], [0, 0.55, 0])
          return <circle key={i} cx={540} cy={920} r={r} stroke={brandColor} strokeWidth={3} fill="none" opacity={op} />
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ── Location & Place ──────────────────────────────────────────────────────────

function PinDrop({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.85

  const pinSp = spring({ frame, fps, config: { stiffness: 110, damping: 9 } })
  const pinY = interpolate(pinSp, [0, 1], [-220, 0])
  const bounceSp = spring({ frame: Math.max(0, frame - 6), fps, config: { stiffness: 200, damping: 9, mass: 0.55 } })
  const squish = interpolate(bounceSp, [0, 1], [0.65, 1])

  const r1 = interpolate(frame, [14, 50], [0, 200], { extrapolateRight: 'clamp' })
  const r2 = interpolate(frame, [22, 65], [0, 230], { extrapolateRight: 'clamp' })
  const op1 = interpolate(frame, [14, 22, 50], [0, 0.6, 0], { extrapolateRight: 'clamp' })
  const op2 = interpolate(frame, [22, 30, 65], [0, 0.45, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <ellipse cx={540} cy={700} rx={r1} ry={r1 * 0.28} stroke={brandColor} strokeWidth={3} fill="none" opacity={op1} />
        <ellipse cx={540} cy={700} rx={r2} ry={r2 * 0.28} stroke={brandColor} strokeWidth={2} fill="none" opacity={op2} />
        <g transform={`translate(540, ${500 + pinY}) scale(1, ${squish})`}>
          <circle cx={0} cy={-110} r={75} fill={brandColor} opacity={0.92} />
          <circle cx={0} cy={-110} r={36} fill="rgba(0,0,0,0.28)" />
          <path d="M -55,-110 Q -55,0 0,120 Q 55,0 55,-110 Z" fill={brandColor} opacity={0.92} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

function CitySkyline({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.55
  const slideUp = interpolate(frame, [0, 28], [90, 0], { extrapolateRight: 'clamp' })

  // Building data: [x, y-top, width, height]
  const buildings = [
    [0, 1680, 160, 240], [140, 1590, 110, 330], [230, 1540, 150, 380],
    [360, 1645, 130, 275], [465, 1510, 170, 410], [610, 1575, 110, 345],
    [695, 1490, 190, 430], [860, 1555, 130, 365], [965, 1615, 145, 305],
    [1055, 1670, 90, 250],
  ]

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(0, ${slideUp})`}>
          {buildings.map(([x, y, w, h], bi) => (
            <g key={bi}>
              <rect x={x} y={y} width={w} height={h} fill={brandColor} rx={2} />
              {/* Deterministic windows */}
              {Array.from({ length: Math.floor(h / 80) }, (_, row) =>
                Array.from({ length: Math.floor(w / 40) }, (_, col) => {
                  const lit = ((bi * 7 + row * 3 + col * 5) % 10) > 3
                  return lit ? (
                    <rect key={`${row}-${col}`}
                      x={x + col * 40 + 10} y={y + row * 80 + 18}
                      width={22} height={38} fill="rgba(0,0,0,0.38)" rx={2} />
                  ) : null
                })
              )}
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// ── Atmosphere ────────────────────────────────────────────────────────────────

function Particles({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.48
  const N = 30
  const ps = Array.from({ length: N }, (_, i) => ({
    x: 60 + (i * 283) % 960,
    baseY: 180 + (i * 197) % 1420,
    r: 4 + (i * 9) % 15,
    speed: 0.28 + (i * 0.19) % 0.85,
    phase: (i * 73) % (durationInFrames || 60),
  }))
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {ps.map((p, i) => {
          const y = ((p.baseY - (frame - p.phase) * p.speed * 1.6 + 1920 * 4) % 1920)
          const dv = Math.abs(y / 1920 - 0.5) * 2
          return (
            <circle key={i}
              cx={p.x + Math.sin(frame * 0.028 + i * 1.4) * 22}
              cy={y} r={p.r}
              fill={brandColor}
              opacity={interpolate(dv, [0, 1], [0.65, 0.08])} />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

function LightRays({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.38
  const rot = interpolate(frame, [0, durationInFrames], [0, 7])
  const N = 10
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`rotate(${rot} 540 0)`}>
          {Array.from({ length: N }, (_, i) => {
            if (i % 2 !== 0) return null
            const spread = 55
            const a0 = ((i / N) * 200 - 100 - spread / 2) * Math.PI / 180
            const a1 = ((i / N) * 200 - 100 + spread / 2) * Math.PI / 180
            const dist = 2600
            return (
              <polygon key={i}
                points={`540,0 ${540 + Math.cos(a0) * dist},${Math.sin(a0) * dist} ${540 + Math.cos(a1) * dist},${Math.sin(a1) * dist}`}
                fill={brandColor} opacity={0.07} />
            )
          })}
        </g>
      </svg>
    </AbsoluteFill>
  )
}

function Aurora({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const t = frame / (durationInFrames || 60)
  const shift1x = 30 + t * 40, shift1y = 18 + Math.sin(t * Math.PI * 2.2) * 14
  const shift2x = 75 - t * 28, shift2y = 45 + Math.cos(t * Math.PI * 1.8) * 18
  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 130% 48% at ${shift1x}% ${shift1y}%, ${brandColor}2e 0%, transparent 58%),
          radial-gradient(ellipse 90% 40% at ${shift2x}% ${shift2y}%, ${brandColor}1a 0%, transparent 52%)
        `,
      }} />
    </AbsoluteFill>
  )
}

// ── People & Community ────────────────────────────────────────────────────────

function DotsFill({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.32
  const TOTAL = 55
  const ps = Array.from({ length: TOTAL }, (_, i) => ({
    x: 70 + (i * 197) % 940,
    y: 180 + (i * 139) % 1440,
    r: 7 + (i * 13) % 22,
  }))
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {ps.map((p, i) => {
          const ap = fi(frame, i * (durationInFrames * 0.55 / TOTAL), i * (durationInFrames * 0.55 / TOTAL) + 9)
          return <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={brandColor} opacity={ap * 0.65} />
        })}
      </svg>
    </AbsoluteFill>
  )
}

// ── Typography ────────────────────────────────────────────────────────────────

function NeonGlow({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.55
  const pulse = interpolate(Math.sin(frame * 0.14), [-1, 1], [0.45, 1.0])
  return (
    <AbsoluteFill style={{ opacity: opacity * pulse }}>
      <div style={{
        position: 'absolute', inset: 56, borderRadius: 44,
        border: `3px solid ${brandColor}`,
        boxShadow: `0 0 32px ${brandColor}60, 0 0 90px ${brandColor}28, inset 0 0 48px ${brandColor}0f`,
      }} />
    </AbsoluteFill>
  )
}

// ── Industry Icons ────────────────────────────────────────────────────────────

function IconMotif({ brandColor, emoji }: { brandColor: string; emoji: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 } })
  const scale = interpolate(sp, [0, 1], [0.55, 1])
  const opacity = interpolate(sp, [0, 0.28], [0, 0.32])
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', opacity }}>
      <div style={{
        fontSize: 500, transform: `scale(${scale})`,
        filter: `drop-shadow(0 0 70px ${brandColor}60)`,
        userSelect: 'none', lineHeight: 1,
      }}>{emoji}</div>
    </AbsoluteFill>
  )
}

// ── Brand & Proof ─────────────────────────────────────────────────────────────

// Four Google-color arcs that fill in progressively — recognisable brand signal.
function GoogleG({ brandColor: _ }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.40
  const progress = interpolate(frame, [5, 48], [0, 1], { extrapolateRight: 'clamp' })
  const cx = 540, cy = 960, r = 270
  const C = 2 * Math.PI * r
  const colors = ['#4285F4', '#34A853', '#FBBC04', '#EA4335']
  const rotations = [-90, 0, 90, 180]
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {colors.map((color, i) => {
          const arcLen = C * 0.22 * progress
          return (
            <circle key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth={18}
              strokeDasharray={`${arcLen} ${C}`}
              transform={`rotate(${rotations[i]} ${cx} ${cy})`}
              strokeLinecap="round"
            />
          )
        })}
        {/* Center G */}
        <text
          x={cx} y={cy + 42}
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontSize={160}
          fontWeight="700"
          fill="#4285F4"
          opacity={interpolate(frame, [20, 40], [0, 0.55], { extrapolateRight: 'clamp' })}
        >G</text>
      </svg>
    </AbsoluteFill>
  )
}

// Calendar grid with cells filling up — great for "booked solid" proof slides.
function CalendarFill({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.38
  const COLS = 7, ROWS = 5, TOTAL = COLS * ROWS
  const cellW = 90, cellH = 72, gapX = 20, gapY = 16
  const gridW = COLS * cellW + (COLS - 1) * gapX
  const gridH = ROWS * cellH + (ROWS - 1) * gapY
  const startX = (1080 - gridW) / 2
  const startY = (1920 - gridH) / 2

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const x = startX + col * (cellW + gapX)
          const y = startY + row * (cellH + gapY)
          const threshold = (i / TOTAL) * durationInFrames * 0.70
          const cellP = fi(frame, threshold, threshold + 6)
          const filled = cellP > 0.5
          return (
            <rect key={i}
              x={x} y={y} width={cellW * cellP} height={cellH}
              rx={8}
              fill={filled ? brandColor : `${brandColor}30`}
              opacity={cellP * 0.72}
            />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Phone silhouette that glows — perfect for social media / review themes.
function PhoneFrame({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sp = spring({ frame, fps, config: { stiffness: 40, damping: 18 } })
  const scale = interpolate(sp, [0, 1], [0.75, 1])
  const opacity = fi(frame) * 0.35
  const pulse = 0.7 + Math.sin(frame * 0.10) * 0.3
  const cx = 540, cy = 960
  const pw = 260, ph = 520, pr = 36
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}>
          {/* Phone body */}
          <rect x={cx - pw/2} y={cy - ph/2} width={pw} height={ph} rx={pr}
            fill="none" stroke={brandColor} strokeWidth={8} opacity={0.55} />
          {/* Screen glow */}
          <rect x={cx - pw/2 + 14} y={cy - ph/2 + 60} width={pw - 28} height={ph - 120} rx={pr - 10}
            fill={brandColor} opacity={0.08 * pulse} />
          {/* Speaker */}
          <rect x={cx - 36} y={cy - ph/2 + 26} width={72} height={10} rx={5}
            fill={brandColor} opacity={0.4} />
          {/* Home button line */}
          <rect x={cx - 28} y={cy + ph/2 - 42} width={56} height={8} rx={4}
            fill={brandColor} opacity={0.4} />
          {/* Notification dots */}
          {[0, 1, 2].map(i => (
            <circle key={i}
              cx={cx - 30 + i * 30} cy={cy}
              r={interpolate(frame, [i * 8, i * 8 + 14], [0, 7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
              fill={brandColor} opacity={0.55}
            />
          ))}
        </g>
        {/* Outer glow ring */}
        <ellipse cx={cx} cy={cy} rx={pw * 0.85} ry={ph * 0.55}
          fill="none" stroke={brandColor} strokeWidth={2}
          opacity={interpolate(Math.sin(frame * 0.08), [-1, 1], [0.04, 0.14])}
        />
      </svg>
    </AbsoluteFill>
  )
}

// Trophy rising up — for awards, achievements, or "best in class" claims.
function Trophy({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const sp = spring({ frame, fps, config: { stiffness: 32, damping: 16 } })
  const translateY = interpolate(sp, [0, 1], [180, 0])
  const opacity = fi(frame) * 0.36
  const cx = 540, cy = 960
  const glow = `drop-shadow(0 0 55px ${brandColor}70) drop-shadow(0 0 20px ${brandColor}50)`
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(0, ${translateY})`} filter={glow}>
          {/* Cup body */}
          <path
            d={`M${cx - 120},${cy - 200} C${cx - 120},${cy + 60} ${cx + 120},${cy + 60} ${cx + 120},${cy - 200} Z`}
            fill={brandColor} opacity={0.45}
          />
          {/* Handles */}
          <path d={`M${cx - 120},${cy - 130} Q${cx - 190},${cy - 130} ${cx - 190},${cy - 60} Q${cx - 190},${cy + 10} ${cx - 120},${cy + 10}`}
            fill="none" stroke={brandColor} strokeWidth={18} strokeLinecap="round" opacity={0.55} />
          <path d={`M${cx + 120},${cy - 130} Q${cx + 190},${cy - 130} ${cx + 190},${cy - 60} Q${cx + 190},${cy + 10} ${cx + 120},${cy + 10}`}
            fill="none" stroke={brandColor} strokeWidth={18} strokeLinecap="round" opacity={0.55} />
          {/* Stem */}
          <rect x={cx - 16} y={cy + 60} width={32} height={100} rx={8} fill={brandColor} opacity={0.45} />
          {/* Base */}
          <rect x={cx - 90} y={cy + 155} width={180} height={28} rx={10} fill={brandColor} opacity={0.50} />
          {/* Star */}
          <text x={cx} y={cy - 60} textAnchor="middle" fontSize={80} fill="rgba(255,255,255,0.55)" fontFamily="system-ui">★</text>
        </g>
      </svg>
    </AbsoluteFill>
  )
}
