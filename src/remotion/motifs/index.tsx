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
  // Narrative & Story
  | 'flame' | 'waveform' | 'globe_spin' | 'tooth_pull' | 'bar_chart_rise' | 'line_chart_rise' | 'chat_bubbles' | 'heart_pulse' | 'lightning_bolt' | 'rocket_launch' | 'compass_north' | 'magnify_scan' | 'hourglass_flow' | 'road_vanish' | 'dna_helix' | 'shield_check' | 'lightbulb_on' | 'handshake' | 'sun_rise' | 'wave_pulse' | 'clock_spin' | 'coffee_steam' | 'target_hit' | 'water_drop' | 'growth_tree'
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
    case 'flame':          return <Flame {...p} />
    case 'waveform':       return <Waveform {...p} />
    case 'globe_spin':     return <GlobeSpin {...p} />
    case 'tooth_pull':     return <ToothPull {...p} />
    case 'bar_chart_rise': return <BarChartRise {...p} />
    case 'line_chart_rise':return <LineChartRise {...p} />
    case 'chat_bubbles':   return <ChatBubbles {...p} />
    case 'heart_pulse':    return <HeartPulse {...p} />
    case 'lightning_bolt': return <LightningBolt {...p} />
    case 'rocket_launch':  return <RocketLaunch {...p} />
    case 'compass_north':  return <CompassNorth {...p} />
    case 'magnify_scan':   return <MagnifyScan {...p} />
    case 'hourglass_flow': return <HourglassFlow {...p} />
    case 'road_vanish':    return <RoadVanish {...p} />
    case 'dna_helix':      return <DnaHelix {...p} />
    case 'shield_check':   return <ShieldCheck {...p} />
    case 'lightbulb_on':   return <LightbulbOn {...p} />
    case 'handshake':      return <Handshake {...p} />
    case 'sun_rise':       return <SunRise {...p} />
    case 'wave_pulse':     return <WavePulse {...p} />
    case 'clock_spin':     return <ClockSpin {...p} />
    case 'coffee_steam':   return <CoffeeSteam {...p} />
    case 'target_hit':     return <TargetHit {...p} />
    case 'water_drop':     return <WaterDrop {...p} />
    case 'growth_tree':    return <GrowthTree {...p} />
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

// ── Narrative & Story ─────────────────────────────────────────────────────────

// Stylized fire — passion, energy, "on fire" performance
function Flame({ brandColor: _ }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.72
  const flicker = Math.sin(frame * 0.38) * 12 + Math.sin(frame * 0.71) * 6
  const scaleY = 1 + Math.sin(frame * 0.22) * 0.05
  const scaleX = 1 + Math.sin(frame * 0.31) * 0.03

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 400 650" style={{ width: '68%', height: '68%', transform: `translateX(${flicker}px) scaleY(${scaleY}) scaleX(${scaleX})`, transformOrigin: 'bottom center' }}>
        <defs>
          <linearGradient id="fg1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#cc2200" />
            <stop offset="40%" stopColor="#ff5500" />
            <stop offset="100%" stopColor="#ffcc00" />
          </linearGradient>
          <linearGradient id="fg2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff6600" />
            <stop offset="100%" stopColor="#ffee44" />
          </linearGradient>
          <radialGradient id="fglow" cx="50%" cy="85%" r="50%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Glow base */}
        <ellipse cx={200} cy={580} rx={180} ry={60} fill="url(#fglow)" />
        {/* Outer flame */}
        <path d="M200,620 C90,540 50,420 75,290 C88,220 118,175 142,110 C152,84 157,52 151,18 C182,62 188,108 183,150 C212,96 224,44 218,4 C264,58 284,132 268,196 C284,164 299,120 294,78 C337,142 346,218 323,296 C344,272 350,238 345,205 C378,278 371,355 343,414 C364,390 372,356 368,322 C391,398 384,472 344,530 C312,556 262,568 200,620 Z" fill="url(#fg1)" />
        {/* Inner highlight */}
        <path d="M200,575 C155,510 148,428 168,348 C176,308 192,274 196,234 C208,265 213,308 207,348 C227,314 238,270 232,230 C253,270 258,326 246,374 C262,350 267,316 261,289 C276,334 274,392 254,440 C270,416 276,382 270,354 C284,398 277,456 254,498 C238,522 222,540 200,575 Z" fill="url(#fg2)" opacity={0.65} />
      </svg>
    </AbsoluteFill>
  )
}

// Pulsing audio waveform bars — sound, voice, communication
function Waveform({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.62
  const N = 28

  return (
    <AbsoluteFill style={{ opacity, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 640 320" style={{ width: '82%' }}>
        {Array.from({ length: N }, (_, i) => {
          const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.72 + 0.4))
          const anim = base * (0.75 + 0.25 * Math.sin(frame * 0.18 + i * 0.48))
          const h = anim * 220
          const x = i * (640 / N) + (640 / N - 14) / 2
          const enterP = fi(frame, i * 2.2, i * 2.2 + 10)
          return (
            <rect key={i} x={x} y={160 - (h * enterP) / 2} width={14} height={h * enterP}
              rx={7} fill={brandColor} opacity={0.55 + (i % 4) * 0.1} />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Spinning globe with latitude/longitude lines — travel, distance, global
function GlobeSpin({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.50
  const rot = interpolate(frame, [0, durationInFrames], [0, 120])
  const cx = 540, cy = 960, R = 320

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={brandColor} strokeWidth={3} opacity={0.5} />
        {/* Latitude lines */}
        {[-3, -1, 0, 1, 3].map((lat, i) => {
          const y = cy + lat * R / 4
          const rLat = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)))
          return <ellipse key={i} cx={cx} cy={y} rx={rLat} ry={rLat * 0.15} fill="none" stroke={brandColor} strokeWidth={2} opacity={0.3} />
        })}
        {/* Longitude lines (rotating) */}
        {[0, 1, 2].map((i) => {
          const angle = (rot + i * 60) * Math.PI / 180
          const rx = Math.abs(Math.cos(angle)) * R
          return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={R} fill="none" stroke={brandColor} strokeWidth={2} opacity={0.35} />
        })}
        {/* Dot on globe */}
        <circle cx={cx + Math.sin(rot * Math.PI / 180) * R * 0.7} cy={cy - R * 0.4} r={12} fill={brandColor} opacity={0.7} />
      </svg>
    </AbsoluteFill>
  )
}

// Tooth being extracted upward — dental, pain-free, extraction
function ToothPull({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.62
  const sp = spring({ frame, fps, config: { stiffness: 28, damping: 14 } })
  const toothY = interpolate(sp, [0, 1], [40, -120])
  const cx = 540, baseY = 1080

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Gum line */}
        <path d={`M${cx - 280},${baseY} Q${cx},${baseY - 60} ${cx + 280},${baseY}`}
          fill="none" stroke={brandColor} strokeWidth={6} opacity={0.4} />
        {/* Tooth crown */}
        <g transform={`translate(0, ${toothY})`}>
          <path d={`M${cx - 80},${baseY - 20} C${cx - 85},${baseY - 180} ${cx - 90},${baseY - 280} ${cx - 60},${baseY - 320} L${cx},${baseY - 340} L${cx + 60},${baseY - 320} C${cx + 90},${baseY - 280} ${cx + 85},${baseY - 180} ${cx + 80},${baseY - 20} Z`}
            fill={brandColor} opacity={0.55} />
          {/* Roots */}
          <path d={`M${cx - 55},${baseY - 10} C${cx - 60},${baseY + 80} ${cx - 50},${baseY + 140} ${cx - 40},${baseY + 160}`}
            fill="none" stroke={brandColor} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
          <path d={`M${cx + 55},${baseY - 10} C${cx + 60},${baseY + 80} ${cx + 50},${baseY + 140} ${cx + 40},${baseY + 160}`}
            fill="none" stroke={brandColor} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
          {/* Shine */}
          <path d={`M${cx - 30},${baseY - 280} C${cx - 20},${baseY - 250} ${cx - 15},${baseY - 220} ${cx - 20},${baseY - 200}`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* Motion lines */}
        {[0, 1, 2].map(i => (
          <line key={i}
            x1={cx - 120 + i * 60} y1={baseY - 360 + toothY}
            x2={cx - 120 + i * 60} y2={baseY - 300 + toothY}
            stroke={brandColor} strokeWidth={3} opacity={interpolate(sp, [0.3, 1], [0, 0.5])}
            strokeDasharray="8 8" />
        ))}
      </svg>
    </AbsoluteFill>
  )
}

// Bar chart building — data, growth, numbers
function BarChartRise({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.55
  const bars = [0.45, 0.65, 0.35, 0.85, 0.55, 0.95, 0.70]
  const maxH = 500, baseY = 1300, barW = 80, gap = 40
  const totalW = bars.length * (barW + gap) - gap
  const startX = (1080 - totalW) / 2

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Baseline */}
        <line x1={startX - 20} y1={baseY} x2={startX + totalW + 20} y2={baseY}
          stroke={brandColor} strokeWidth={3} opacity={0.4} />
        {bars.map((h, i) => {
          const sp = spring({ frame: Math.max(0, frame - i * 5), fps: 30, config: { stiffness: 60, damping: 14 } })
          const barH = h * maxH * sp
          const x = startX + i * (barW + gap)
          return (
            <g key={i}>
              <rect x={x} y={baseY - barH} width={barW} height={barH}
                rx={6} fill={brandColor} opacity={0.5 + i * 0.04} />
              {/* Top cap glow */}
              <rect x={x} y={baseY - barH} width={barW} height={8}
                rx={4} fill={brandColor} opacity={0.8} />
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Rising line chart — growth, improvement, progress over time
function LineChartRise({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.55
  const points = [
    [80, 900], [220, 820], [360, 780], [480, 700], [600, 620], [720, 550], [840, 460], [960, 360], [1000, 300]
  ]
  const progress = interpolate(frame, [5, durationInFrames * 0.75], [0, 1], { extrapolateRight: 'clamp' })
  const visibleCount = Math.max(2, Math.floor(progress * points.length))
  const visiblePts = points.slice(0, visibleCount)

  const pathD = visiblePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const areaD = pathD + ` L${visiblePts[visiblePts.length - 1][0]},1100 L${points[0][0]},1100 Z`

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Area fill */}
        <path d={areaD} fill={brandColor} opacity={0.12} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={brandColor} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
        {/* Dot at tip */}
        {visiblePts.length > 0 && (
          <circle cx={visiblePts[visiblePts.length - 1][0]} cy={visiblePts[visiblePts.length - 1][1]}
            r={14} fill={brandColor} opacity={0.8} />
        )}
        {/* Grid lines */}
        {[700, 850, 1000].map((y, i) => (
          <line key={i} x1={60} y1={y} x2={1020} y2={y}
            stroke={brandColor} strokeWidth={1} strokeDasharray="12 8" opacity={0.15} />
        ))}
      </svg>
    </AbsoluteFill>
  )
}

// Conversation speech bubbles — testimonials, reviews, word of mouth
function ChatBubbles({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const bubbles = [
    { x: 200, y: 700, w: 340, h: 100, delay: 0, flip: false },
    { x: 540, y: 900, w: 380, h: 100, delay: 12, flip: true },
    { x: 180, y: 1100, w: 300, h: 100, delay: 24, flip: false },
  ]

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {bubbles.map((b, i) => {
          const sp = spring({ frame: Math.max(0, frame - b.delay), fps, config: { stiffness: 120, damping: 14 } })
          const scale = interpolate(sp, [0, 1], [0.5, 1])
          const bOpacity = interpolate(sp, [0, 0.3], [0, 1])
          const tailX = b.flip ? b.x + b.w - 40 : b.x + 40
          return (
            <g key={i} transform={`translate(${b.x + b.w / 2}, ${b.y + b.h / 2}) scale(${scale}) translate(${-(b.x + b.w / 2)}, ${-(b.y + b.h / 2)})`} opacity={bOpacity}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={24} fill={brandColor} opacity={0.35} />
              {/* Tail */}
              <path d={b.flip
                ? `M${tailX},${b.y + b.h} L${tailX + 20},${b.y + b.h + 30} L${tailX - 20},${b.y + b.h}`
                : `M${tailX},${b.y + b.h} L${tailX - 20},${b.y + b.h + 30} L${tailX + 20},${b.y + b.h}`}
                fill={brandColor} opacity={0.35} />
              {/* Dots */}
              {[0, 1, 2].map(d => (
                <circle key={d} cx={b.x + 60 + d * 50} cy={b.y + b.h / 2} r={10} fill={brandColor} opacity={0.6} />
              ))}
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Beating heart — care, emotional connection, love
function HeartPulse({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.58
  // Heartbeat: quick scale up, slow decay, repeat every 40 frames
  const beat = frame % 40
  const beatScale = beat < 8
    ? interpolate(beat, [0, 4, 8], [1, 1.18, 1])
    : 1
  const sp = spring({ frame, fps, config: { stiffness: 45, damping: 18 } })
  const entryScale = interpolate(sp, [0, 1], [0.4, 1])
  const cx = 540, cy = 960

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${entryScale * beatScale}) translate(${-cx},${-cy})`}>
          {/* Glow */}
          <circle cx={cx} cy={cy - 20} r={260} fill={brandColor} opacity={0.08 * beatScale} />
          {/* Heart path */}
          <path d={`M${cx},${cy + 180} C${cx - 340},${cy - 80} ${cx - 380},${cy - 340} ${cx - 180},${cy - 360} C${cx - 60},${cy - 370} ${cx},${cy - 280} ${cx},${cy - 280} C${cx},${cy - 280} ${cx + 60},${cy - 370} ${cx + 180},${cy - 360} C${cx + 380},${cy - 340} ${cx + 340},${cy - 80} ${cx},${cy + 180} Z`}
            fill={brandColor} opacity={0.55} />
          {/* Shine */}
          <path d={`M${cx - 120},${cy - 320} C${cx - 80},${cy - 290} ${cx - 70},${cy - 250} ${cx - 90},${cy - 220}`}
            fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={16} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Lightning bolt — energy, speed, power, instant results
function LightningBolt({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.62
  const sp = spring({ frame, fps, config: { stiffness: 280, damping: 14 } })
  const entryScale = interpolate(sp, [0, 1], [0.3, 1])
  const flash = frame % 60 < 4 ? 1.4 : 1
  const cx = 540, cy = 960

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${entryScale * flash}) translate(${-cx},${-cy})`}>
          {/* Glow */}
          <ellipse cx={cx} cy={cy} rx={220} ry={360} fill={brandColor} opacity={0.08} />
          <ellipse cx={cx} cy={cy} rx={140} ry={260} fill={brandColor} opacity={0.06} />
          {/* Bolt */}
          <path d={`M${cx + 80},${cy - 340} L${cx - 60},${cy - 20} L${cx + 30},${cy - 20} L${cx - 80},${cy + 340} L${cx + 60},${cy + 20} L${cx - 20},${cy + 20} Z`}
            fill={brandColor} opacity={0.65} />
          {/* Edge highlight */}
          <path d={`M${cx + 80},${cy - 340} L${cx - 60},${cy - 20} L${cx + 30},${cy - 20}`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={8} strokeLinejoin="round" />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Rocket launching — transformation, fast results, new beginning
function RocketLaunch({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.60
  const sp = spring({ frame, fps, config: { stiffness: 22, damping: 12 } })
  const rocketY = interpolate(sp, [0, 1], [200, -300])
  const cx = 540, cy = 960

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Exhaust trail */}
        {frame > 8 && (
          <ellipse cx={cx} cy={cy + 200 - rocketY * 0.3} rx={30} ry={interpolate(sp, [0, 1], [0, 120])}
            fill={brandColor} opacity={0.2} />
        )}
        <g transform={`translate(0, ${rocketY})`}>
          {/* Body */}
          <path d={`M${cx},${cy - 260} C${cx - 55},${cy - 200} ${cx - 60},${cy - 60} ${cx - 60},${cy + 60} L${cx + 60},${cy + 60} C${cx + 60},${cy - 60} ${cx + 55},${cy - 200} ${cx},${cy - 260} Z`}
            fill={brandColor} opacity={0.55} />
          {/* Nose cone */}
          <path d={`M${cx},${cy - 380} L${cx - 60},${cy - 260} L${cx + 60},${cy - 260} Z`}
            fill={brandColor} opacity={0.70} />
          {/* Fins */}
          <path d={`M${cx - 60},${cy + 20} L${cx - 110},${cy + 80} L${cx - 60},${cy + 60} Z`}
            fill={brandColor} opacity={0.50} />
          <path d={`M${cx + 60},${cy + 20} L${cx + 110},${cy + 80} L${cx + 60},${cy + 60} Z`}
            fill={brandColor} opacity={0.50} />
          {/* Window */}
          <circle cx={cx} cy={cy - 140} r={32} fill="rgba(255,255,255,0.25)" stroke={brandColor} strokeWidth={4} opacity={0.7} />
          {/* Flame */}
          <ellipse cx={cx} cy={cy + 100} rx={28} ry={interpolate(Math.sin(frame * 0.5), [-1, 1], [40, 65])}
            fill="#ffaa00" opacity={0.7} />
        </g>
        {/* Stars */}
        {[0, 1, 2, 3, 4].map(i => {
          const sx = 120 + (i * 213) % 840
          const sy = 400 + (i * 177) % 800
          const twinkle = 0.3 + 0.4 * Math.sin(frame * 0.2 + i * 1.3)
          return <circle key={i} cx={sx} cy={sy} r={4 + (i % 3) * 2} fill={brandColor} opacity={twinkle * 0.5} />
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Compass needle swinging to North — direction, finding the right path
function CompassNorth({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const sp = spring({ frame, fps, config: { stiffness: 30, damping: 8 } })
  // Needle overshoots to north (0°) with wobble
  const needleRot = interpolate(sp, [0, 1], [135, 0])
  const cx = 540, cy = 960, R = 300

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Compass rose circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={brandColor} strokeWidth={4} opacity={0.35} />
        <circle cx={cx} cy={cy} r={R - 20} fill="none" stroke={brandColor} strokeWidth={1.5} opacity={0.15} />
        {/* Cardinal directions */}
        {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([label, angle]) => {
          const rad = (Number(angle) - 90) * Math.PI / 180
          const tx = cx + (R - 44) * Math.cos(rad)
          const ty = cy + (R - 44) * Math.sin(rad)
          return (
            <text key={String(label)} x={tx} y={ty + 12} textAnchor="middle"
              fontSize={44} fontWeight="700" fill={brandColor}
              opacity={String(label) === 'N' ? 0.9 : 0.4} fontFamily="system-ui">
              {String(label)}
            </text>
          )
        })}
        {/* Needle */}
        <g transform={`rotate(${needleRot} ${cx} ${cy})`}>
          <path d={`M${cx},${cy - R + 40} L${cx - 18},${cy + 20} L${cx},${cy} L${cx + 18},${cy + 20} Z`}
            fill={brandColor} opacity={0.75} />
          <path d={`M${cx},${cy + R - 40} L${cx - 18},${cy - 20} L${cx},${cy} L${cx + 18},${cy - 20} Z`}
            fill={brandColor} opacity={0.28} />
        </g>
        {/* Center dot */}
        <circle cx={cx} cy={cy} r={14} fill={brandColor} opacity={0.7} />
      </svg>
    </AbsoluteFill>
  )
}

// Magnifying glass scanning — discovery, insight, details matter
function MagnifyScan({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.50
  const scanX = interpolate(frame, [10, durationInFrames * 0.8], [200, 880], { extrapolateRight: 'clamp' })
  const scanY = interpolate(frame, [10, durationInFrames * 0.8], [700, 1200], { extrapolateRight: 'clamp' })
  const R = 130

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Scan highlight circle */}
        <circle cx={scanX} cy={scanY} r={R} fill={brandColor} opacity={0.07} />
        {/* Lens ring */}
        <circle cx={scanX} cy={scanY} r={R} fill="none" stroke={brandColor} strokeWidth={6} opacity={0.5} />
        {/* Inner lens glare */}
        <circle cx={scanX - R * 0.3} cy={scanY - R * 0.3} r={R * 0.2}
          fill="rgba(255,255,255,0.12)" />
        {/* Handle */}
        <line x1={scanX + R * 0.72} y1={scanY + R * 0.72}
          x2={scanX + R * 0.72 + 110} y2={scanY + R * 0.72 + 110}
          stroke={brandColor} strokeWidth={16} strokeLinecap="round" opacity={0.55} />
      </svg>
    </AbsoluteFill>
  )
}

// Hourglass with flowing sand — time, patience, results take time
function HourglassFlow({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const progress = interpolate(frame, [10, durationInFrames * 0.85], [0, 1], { extrapolateRight: 'clamp' })
  const cx = 540, cy = 960
  const topH = 280, botH = 280, w = 200

  // Sand level in top chamber (decreasing)
  const topSand = (1 - progress) * topH

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Outer frame */}
        <path d={`M${cx - w},${cy - topH - 40} L${cx + w},${cy - topH - 40} L${cx + 20},${cy} L${cx + w},${cy + botH + 40} L${cx - w},${cy + botH + 40} L${cx - 20},${cy} Z`}
          fill="none" stroke={brandColor} strokeWidth={5} opacity={0.4} />
        {/* Top sand */}
        <clipPath id="topClip">
          <path d={`M${cx - w},${cy - topH - 40} L${cx + w},${cy - topH - 40} L${cx + 20},${cy} L${cx - 20},${cy} Z`} />
        </clipPath>
        <rect x={cx - w} y={cy - topH - 40 + (topH - topSand)} width={w * 2} height={topSand + 40}
          fill={brandColor} opacity={0.35} clipPath="url(#topClip)" />
        {/* Sand stream */}
        {progress < 0.98 && (
          <ellipse cx={cx} cy={cy + 20} rx={4} ry={interpolate(Math.sin(frame * 0.4), [-1, 1], [6, 14])}
            fill={brandColor} opacity={0.55} />
        )}
        {/* Bottom sand (accumulating) */}
        <clipPath id="botClip">
          <path d={`M${cx - 20},${cy} L${cx + 20},${cy} L${cx + w},${cy + botH + 40} L${cx - w},${cy + botH + 40} Z`} />
        </clipPath>
        <rect x={cx - w} y={cy + botH + 40 - progress * botH} width={w * 2} height={progress * botH + 10}
          fill={brandColor} opacity={0.35} clipPath="url(#botClip)" />
      </svg>
    </AbsoluteFill>
  )
}

// Road vanishing point — journey, travel far, long-term commitment
function RoadVanish({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.48
  const vx = 540, vy = 800
  // Road markings scroll toward viewer
  const scroll = (frame * 8) % 120

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Sky gradient hint */}
        <rect x={0} y={0} width={1080} height={vy} fill={brandColor} opacity={0.04} />
        {/* Left road edge */}
        <line x1={vx} y1={vy} x2={80} y2={1920} stroke={brandColor} strokeWidth={4} opacity={0.40} />
        {/* Right road edge */}
        <line x1={vx} y1={vy} x2={1000} y2={1920} stroke={brandColor} strokeWidth={4} opacity={0.40} />
        {/* Dashed center line (scrolling) */}
        {Array.from({ length: 14 }, (_, i) => {
          const t1 = (i / 14 + scroll / (14 * 120)) % 1
          const t2 = ((i + 0.5) / 14 + scroll / (14 * 120)) % 1
          const x1 = vx + (540 - vx) * t1, y1 = vy + (1920 - vy) * t1
          const x2 = vx + (540 - vx) * t2, y2 = vy + (1920 - vy) * t2
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={brandColor} strokeWidth={Math.max(1, 5 * t1)} opacity={t1 * 0.45} />
        })}
        {/* Horizon glow */}
        <ellipse cx={vx} cy={vy} rx={180} ry={40} fill={brandColor} opacity={0.12} />
      </svg>
    </AbsoluteFill>
  )
}

// DNA double helix — precision, science, medical expertise
function DnaHelix({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.45
  const rot = interpolate(frame, [0, durationInFrames], [0, 360])
  const cx = 540
  const N = 14

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: N }, (_, i) => {
          const t = i / (N - 1)
          const y = 500 + t * 920
          const phase = (rot + t * 360) * Math.PI / 180
          const x1 = cx + Math.cos(phase) * 220
          const x2 = cx + Math.cos(phase + Math.PI) * 220
          const sz = 8 + Math.abs(Math.cos(phase)) * 10
          const enterP = fi(frame, i * 3, i * 3 + 12)
          return (
            <g key={i} opacity={enterP}>
              {/* Strand 1 dot */}
              <circle cx={x1} cy={y} r={sz} fill={brandColor} opacity={0.6} />
              {/* Strand 2 dot */}
              <circle cx={x2} cy={y} r={sz} fill={brandColor} opacity={0.40} />
              {/* Connecting rung */}
              <line x1={x1} y1={y} x2={x2} y2={y}
                stroke={brandColor} strokeWidth={3} opacity={0.25} />
            </g>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}

// Shield with checkmark — trust, safety, protection, guarantee
function ShieldCheck({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.58
  const sp = spring({ frame, fps, config: { stiffness: 50, damping: 16 } })
  const shieldScale = interpolate(sp, [0, 1], [0.5, 1])
  const checkProgress = interpolate(frame, [18, 42], [0, 1], { extrapolateRight: 'clamp' })
  const cx = 540, cy = 940

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${shieldScale}) translate(${-cx},${-cy})`}>
          {/* Glow */}
          <ellipse cx={cx} cy={cy + 50} rx={260} ry={320} fill={brandColor} opacity={0.07} />
          {/* Shield body */}
          <path d={`M${cx},${cy - 320} C${cx - 240},${cy - 320} ${cx - 280},${cy - 200} ${cx - 280},${cy - 80} C${cx - 280},${cy + 80} ${cx - 160},${cy + 220} ${cx},${cy + 340} C${cx + 160},${cy + 220} ${cx + 280},${cy + 80} ${cx + 280},${cy - 80} C${cx + 280},${cy - 200} ${cx + 240},${cy - 320} ${cx},${cy - 320} Z`}
            fill={brandColor} opacity={0.40} />
          {/* Check path (drawn progressively) */}
          <polyline
            points={`${cx - 100},${cy + 10} ${cx - 20},${cy + 90} ${cx + 120},${cy - 100}`}
            fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={22}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={380}
            strokeDashoffset={380 * (1 - checkProgress)} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Lightbulb turning on — insight, education, "I never knew that"
function LightbulbOn({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.55
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 16 } })
  const entryScale = interpolate(sp, [0, 1], [0.5, 1])
  const glowPulse = 0.7 + Math.sin(frame * 0.15) * 0.3
  const rayProgress = interpolate(frame, [12, 40], [0, 1], { extrapolateRight: 'clamp' })
  const cx = 540, cy = 920

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${entryScale}) translate(${-cx},${-cy})`}>
          {/* Glow */}
          <circle cx={cx} cy={cy} r={280} fill={brandColor} opacity={0.06 * glowPulse} />
          <circle cx={cx} cy={cy} r={180} fill={brandColor} opacity={0.08 * glowPulse} />
          {/* Rays */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const r1 = 170, r2 = 170 + 90 * rayProgress
            return <line key={i}
              x1={cx + Math.cos(angle) * r1} y1={cy + Math.sin(angle) * r1}
              x2={cx + Math.cos(angle) * r2} y2={cy + Math.sin(angle) * r2}
              stroke={brandColor} strokeWidth={5} strokeLinecap="round"
              opacity={0.45 * rayProgress} />
          })}
          {/* Bulb */}
          <path d={`M${cx - 90},${cy + 100} C${cx - 90},${cy - 60} ${cx - 130},${cy - 160} ${cx},${cy - 220} C${cx + 130},${cy - 160} ${cx + 90},${cy - 60} ${cx + 90},${cy + 100} Z`}
            fill={brandColor} opacity={0.50} />
          {/* Base segments */}
          <rect x={cx - 66} y={cy + 100} width={132} height={22} rx={4} fill={brandColor} opacity={0.40} />
          <rect x={cx - 52} y={cy + 130} width={104} height={22} rx={4} fill={brandColor} opacity={0.35} />
          <rect x={cx - 36} y={cy + 160} width={72} height={20} rx={4} fill={brandColor} opacity={0.30} />
          {/* Filament */}
          <path d={`M${cx - 30},${cy + 60} Q${cx},${cy - 20} ${cx + 30},${cy + 60}`}
            fill="none" stroke="rgba(255,255,200,0.6)" strokeWidth={6} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Two hands coming together — trust, partnership, relationship
function Handshake({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.50
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 16 } })
  const leftX = interpolate(sp, [0, 1], [-200, 0])
  const rightX = interpolate(sp, [0, 1], [200, 0])
  const cx = 540, cy = 960

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Left hand */}
        <g transform={`translate(${leftX}, 0)`}>
          <path d={`M${cx - 240},${cy + 60} L${cx - 60},${cy + 60} L${cx - 60},${cy - 160} C${cx - 60},${cy - 200} ${cx - 100},${cy - 220} ${cx - 140},${cy - 200} L${cx - 240},${cy - 100} Z`}
            fill={brandColor} opacity={0.45} />
          {/* Fingers */}
          {[0, 1, 2].map(i => (
            <rect key={i} x={cx - 200 + i * 40} y={cy - 260 + i * 10} width={28} height={110}
              rx={14} fill={brandColor} opacity={0.40} />
          ))}
        </g>
        {/* Right hand (mirrored) */}
        <g transform={`translate(${rightX}, 0) scale(-1,1) translate(${-1080}, 0)`}>
          <path d={`M${cx - 240},${cy + 60} L${cx - 60},${cy + 60} L${cx - 60},${cy - 160} C${cx - 60},${cy - 200} ${cx - 100},${cy - 220} ${cx - 140},${cy - 200} L${cx - 240},${cy - 100} Z`}
            fill={brandColor} opacity={0.45} />
          {[0, 1, 2].map(i => (
            <rect key={i} x={cx - 200 + i * 40} y={cy - 260 + i * 10} width={28} height={110}
              rx={14} fill={brandColor} opacity={0.40} />
          ))}
        </g>
        {/* Shake glow */}
        <circle cx={cx} cy={cy - 50} r={interpolate(sp, [0.6, 1], [0, 80])} fill={brandColor} opacity={0.10} />
      </svg>
    </AbsoluteFill>
  )
}

// Sun rising — new beginning, hope, transformation complete
function SunRise({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const sp = spring({ frame, fps, config: { stiffness: 28, damping: 16 } })
  const sunY = interpolate(sp, [0, 1], [100, -150])
  const cx = 540, horizonY = 1100, R = 220

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Horizon glow */}
        <ellipse cx={cx} cy={horizonY} rx={500} ry={80} fill={brandColor} opacity={0.12} />
        {/* Horizon line */}
        <line x1={60} y1={horizonY} x2={1020} y2={horizonY} stroke={brandColor} strokeWidth={3} opacity={0.30} />
        {/* Rays (expand as sun rises) */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI // only top half
          const rayLen = R * 0.6 * interpolate(sp, [0.4, 1], [0, 1])
          const x1 = cx + Math.cos(angle) * (R + 20)
          const y1 = horizonY + sunY + Math.sin(angle) * (R + 20)
          return <line key={i} x1={x1} y1={y1}
            x2={cx + Math.cos(angle) * (R + 20 + rayLen)}
            y2={horizonY + sunY + Math.sin(angle) * (R + 20 + rayLen)}
            stroke={brandColor} strokeWidth={5} strokeLinecap="round" opacity={0.40} />
        })}
        {/* Sun (clipped to horizon) */}
        <clipPath id="sunClip">
          <rect x={0} y={0} width={1080} height={horizonY} />
        </clipPath>
        <circle cx={cx} cy={horizonY + sunY} r={R} fill={brandColor} opacity={0.55} clipPath="url(#sunClip)" />
        <circle cx={cx} cy={horizonY + sunY} r={R * 0.65} fill={brandColor} opacity={0.20} clipPath="url(#sunClip)" />
      </svg>
    </AbsoluteFill>
  )
}

// Oscillating sine wave — flow, wellness, relaxation, rhythm
function WavePulse({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const opacity = fi(frame) * 0.50
  const N = 100
  const amp = 120 + Math.sin(frame * 0.08) * 30
  const phase = frame * 0.12

  const pathD = Array.from({ length: N }, (_, i) => {
    const x = 40 + (i / (N - 1)) * 1000
    const y = 960 + Math.sin((i / (N - 1)) * Math.PI * 4 + phase) * amp
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  const pathD2 = Array.from({ length: N }, (_, i) => {
    const x = 40 + (i / (N - 1)) * 1000
    const y = 960 + Math.sin((i / (N - 1)) * Math.PI * 4 + phase + Math.PI * 0.6) * amp * 0.7
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d={pathD} fill="none" stroke={brandColor} strokeWidth={7} strokeLinecap="round" opacity={0.55} />
        <path d={pathD2} fill="none" stroke={brandColor} strokeWidth={4} strokeLinecap="round" opacity={0.28} />
      </svg>
    </AbsoluteFill>
  )
}

// Clock with spinning hands — time-saving, efficiency, "in minutes not hours"
function ClockSpin({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const opacity = fi(frame) * 0.48
  const sp = spring({ frame, fps, config: { stiffness: 40, damping: 16 } })
  const entryScale = interpolate(sp, [0, 1], [0.6, 1])
  const hourRot = interpolate(frame, [0, durationInFrames], [0, 120])
  const minRot = interpolate(frame, [0, durationInFrames], [0, 720])
  const cx = 540, cy = 960, R = 310

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${entryScale}) translate(${-cx},${-cy})`}>
          {/* Face */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke={brandColor} strokeWidth={6} opacity={0.40} />
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2
            const isMajor = i % 3 === 0
            return (
              <line key={i}
                x1={cx + Math.cos(a) * (R - (isMajor ? 40 : 20))}
                y1={cy + Math.sin(a) * (R - (isMajor ? 40 : 20))}
                x2={cx + Math.cos(a) * (R - 8)}
                y2={cy + Math.sin(a) * (R - 8)}
                stroke={brandColor} strokeWidth={isMajor ? 6 : 3} opacity={isMajor ? 0.5 : 0.25} />
            )
          })}
          {/* Hour hand */}
          <g transform={`rotate(${hourRot} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - R * 0.55}
              stroke={brandColor} strokeWidth={10} strokeLinecap="round" opacity={0.65} />
          </g>
          {/* Minute hand */}
          <g transform={`rotate(${minRot} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - R * 0.78}
              stroke={brandColor} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
          </g>
          {/* Center */}
          <circle cx={cx} cy={cy} r={14} fill={brandColor} opacity={0.7} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Coffee cup with steam — cafe, warmth, hospitality, comfort
function CoffeeSteam({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const sp = spring({ frame, fps, config: { stiffness: 45, damping: 16 } })
  const entryScale = interpolate(sp, [0, 1], [0.6, 1])
  const cx = 540, cy = 1060

  // Steam wisps
  const wisps = [
    { xOff: -60, phase: 0 },
    { xOff: 0,   phase: 1.1 },
    { xOff: 60,  phase: 0.6 },
  ]

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g transform={`translate(${cx},${cy}) scale(${entryScale}) translate(${-cx},${-cy})`}>
          {/* Steam */}
          {wisps.map((w, i) => {
            const t = (frame * 0.016 + w.phase) % 1
            const wY = cy - 120 - t * 220
            const wX = cx + w.xOff + Math.sin(t * Math.PI * 3 + w.phase) * 28
            return (
              <ellipse key={i} cx={wX} cy={wY} rx={14} ry={22}
                fill={brandColor} opacity={(1 - t) * 0.35} />
            )
          })}
          {/* Cup body */}
          <path d={`M${cx - 160},${cy - 90} L${cx - 130},${cy + 130} Q${cx},${cy + 160} ${cx + 130},${cy + 130} L${cx + 160},${cy - 90} Z`}
            fill={brandColor} opacity={0.45} />
          {/* Rim */}
          <ellipse cx={cx} cy={cy - 90} rx={162} ry={30} fill={brandColor} opacity={0.35} />
          {/* Saucer */}
          <ellipse cx={cx} cy={cy + 155} rx={210} ry={28} fill={brandColor} opacity={0.30} />
          {/* Handle */}
          <path d={`M${cx + 158},${cy - 50} Q${cx + 240},${cy - 50} ${cx + 240},${cy + 40} Q${cx + 240},${cy + 100} ${cx + 158},${cy + 100}`}
            fill="none" stroke={brandColor} strokeWidth={16} strokeLinecap="round" opacity={0.40} />
          {/* Liquid surface */}
          <ellipse cx={cx} cy={cy - 95} rx={140} ry={22} fill={brandColor} opacity={0.50} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Bullseye target hit — precision, hitting the goal, perfect results
function TargetHit({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const cx = 540, cy = 960

  // Arrow flying in from top-right
  const arrowSp = spring({ frame: Math.max(0, frame - 8), fps, config: { stiffness: 180, damping: 18 } })
  const arrowX = interpolate(arrowSp, [0, 1], [cx + 400, cx + 4])
  const arrowY = interpolate(arrowSp, [0, 1], [cy - 400, cy - 4])

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Rings */}
        {[280, 200, 130, 70, 30].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={brandColor} strokeWidth={i === 4 ? 0 : 4}
            opacity={0.18 + (4 - i) * 0.06} />
        ))}
        {/* Bullseye */}
        <circle cx={cx} cy={cy} r={30} fill={brandColor} opacity={0.50} />
        {/* Arrow */}
        <g transform={`rotate(-45 ${arrowX} ${arrowY})`}>
          <line x1={arrowX - 80} y1={arrowY} x2={arrowX} y2={arrowY}
            stroke={brandColor} strokeWidth={8} strokeLinecap="round" opacity={0.65} />
          {/* Arrowhead */}
          <polygon points={`${arrowX},${arrowY - 16} ${arrowX + 22},${arrowY} ${arrowX},${arrowY + 16}`}
            fill={brandColor} opacity={0.75} />
          {/* Fletching */}
          <path d={`M${arrowX - 80},${arrowY} L${arrowX - 100},${arrowY - 20} L${arrowX - 85},${arrowY}`}
            fill={brandColor} opacity={0.50} />
          <path d={`M${arrowX - 80},${arrowY} L${arrowX - 100},${arrowY + 20} L${arrowX - 85},${arrowY}`}
            fill={brandColor} opacity={0.50} />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Water drop rippling — freshness, clarity, purity
function WaterDrop({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.52
  const sp = spring({ frame, fps, config: { stiffness: 55, damping: 16 } })
  const dropScale = interpolate(sp, [0, 1], [0.4, 1])
  const cx = 540, cy = 880

  // Ripples: staggered expanding rings
  const ripples = [0, 20, 40]

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Ripples */}
        {ripples.map((offset, i) => {
          const t = ((frame + offset) % 80) / 80
          const r = t * 380
          return (
            <ellipse key={i} cx={cx} cy={cy + 240} rx={r} ry={r * 0.30}
              fill="none" stroke={brandColor} strokeWidth={3}
              opacity={(1 - t) * 0.30} />
          )
        })}
        {/* Drop */}
        <g transform={`translate(${cx},${cy}) scale(${dropScale}) translate(${-cx},${-cy})`}>
          <path d={`M${cx},${cy - 240} C${cx - 140},${cy - 80} ${cx - 180},${cy + 60} ${cx - 140},${cy + 160} C${cx - 80},${cy + 280} ${cx + 80},${cy + 280} ${cx + 140},${cy + 160} C${cx + 180},${cy + 60} ${cx + 140},${cy - 80} ${cx},${cy - 240} Z`}
            fill={brandColor} opacity={0.50} />
          {/* Shine */}
          <path d={`M${cx - 50},${cy - 160} C${cx - 30},${cy - 120} ${cx - 25},${cy - 80} ${cx - 40},${cy - 50}`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  )
}

// Tree growing — organic growth, long-term, putting down roots
function GrowthTree({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = fi(frame) * 0.48
  const sp = spring({ frame, fps, config: { stiffness: 22, damping: 16 } })
  const grow = interpolate(sp, [0, 1], [0, 1])
  const cx = 540, groundY = 1280

  // Trunk
  const trunkH = 380 * grow
  // Branch levels
  const branches = [
    { y: groundY - trunkH * 0.45, span: 280, count: 3 },
    { y: groundY - trunkH * 0.68, span: 200, count: 3 },
    { y: groundY - trunkH * 0.85, span: 130, count: 3 },
  ]

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Ground line */}
        <line x1={cx - 300} y1={groundY} x2={cx + 300} y2={groundY}
          stroke={brandColor} strokeWidth={4} opacity={0.30} />
        {/* Trunk */}
        <rect x={cx - 20} y={groundY - trunkH} width={40} height={trunkH}
          rx={10} fill={brandColor} opacity={0.45} />
        {/* Branches */}
        {branches.map((b, bi) => {
          if (grow < 0.3 + bi * 0.2) return null
          const branchGrow = interpolate(grow, [0.3 + bi * 0.2, 0.6 + bi * 0.15], [0, 1], { extrapolateRight: 'clamp' })
          return Array.from({ length: b.count }, (_, i) => {
            const xOff = (i / (b.count - 1) - 0.5) * b.span * 2
            const yOff = -Math.abs(xOff) * 0.4
            return (
              <g key={`${bi}-${i}`}>
                <line x1={cx} y1={b.y} x2={cx + xOff * branchGrow} y2={b.y + yOff * branchGrow}
                  stroke={brandColor} strokeWidth={Math.max(2, 8 - bi * 2)}
                  strokeLinecap="round" opacity={0.40} />
                {/* Leaf cluster */}
                <circle cx={cx + xOff * branchGrow} cy={b.y + yOff * branchGrow - 20 * branchGrow}
                  r={30 * branchGrow + (bi === 0 ? 10 : 0)}
                  fill={brandColor} opacity={0.28 * branchGrow} />
              </g>
            )
          })
        })}
        {/* Top canopy */}
        {grow > 0.75 && (
          <circle cx={cx} cy={groundY - trunkH - 60} r={140 * interpolate(grow, [0.75, 1], [0, 1])}
            fill={brandColor} opacity={0.25} />
        )}
      </svg>
    </AbsoluteFill>
  )
}
