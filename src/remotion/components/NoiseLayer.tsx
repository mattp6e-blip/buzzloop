import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { noise2D } from '@remotion/noise'

// 60 particles with golden-ratio distribution so they space evenly
const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  seed: `p${i}`,
  baseX: (i * 61.8) % 100,
  baseY: (i * 38.2) % 100,
  size: 1.5 + (i % 4) * 0.8,
  opacity: 0.04 + (i % 6) * 0.015,
}))

export function NoiseLayer({ brandColor = '#ffffff' }: { brandColor?: string }) {
  const frame = useCurrentFrame()
  const t = frame / 150  // very slow drift

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {PARTICLES.map((p) => {
        const dx = noise2D(p.seed + 'x', t, 0) * 9
        const dy = noise2D(p.seed + 'y', 0, t) * 9
        const scale = 0.7 + noise2D(p.seed + 's', t * 0.4, 0) * 0.6
        const x = Math.max(0, Math.min(100, p.baseX + dx))
        const y = Math.max(0, Math.min(100, p.baseY + dy))
        return (
          <div
            key={p.seed}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size * scale,
              height: p.size * scale,
              borderRadius: '50%',
              background: brandColor,
              opacity: p.opacity,
              willChange: 'transform',
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}
