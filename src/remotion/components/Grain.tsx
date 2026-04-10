import { AbsoluteFill } from 'remotion'

// Static film grain overlay — adds depth and premium cinematic texture
export function Grain({ opacity = 0.045 }: { opacity?: number }) {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="buzz-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#buzz-grain)" />
      </svg>
    </AbsoluteFill>
  )
}
