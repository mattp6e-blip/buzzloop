'use client'

import dynamic from 'next/dynamic'
import type { ReelTheme } from '@/types'
import type { ReelCompositionProps } from '@/remotion/types'
import { REEL_FPS, REEL_WIDTH, REEL_HEIGHT } from '@/remotion/ReelComposition'

const Player = dynamic(() => import('@remotion/player').then((m) => ({ default: m.Player })), { ssr: false })

const ReelComposition = dynamic(
  () => import('@/remotion/ReelComposition').then((m) => ({ default: m.ReelComposition })),
  { ssr: false }
)

const ReelCompositionV2 = dynamic(
  () => import('@/remotion/ReelCompositionV2').then((m) => ({ default: m.ReelCompositionV2 })),
  { ssr: false }
)

interface Props {
  themes: ReelTheme[]
  brandColor: string
  brandSecondaryColor: string
  logoUrl: string | null
  gbpPhotos: string[]
}

const PLAYER_W = 350
const PLAYER_H = Math.round(PLAYER_W * REEL_HEIGHT / REEL_WIDTH)

function buildInputProps(
  theme: ReelTheme,
  brandColor: string,
  brandSecondaryColor: string,
  logoUrl: string | null,
  gbpPhotos: string[]
): ReelCompositionProps {
  const script = theme.cachedScript!
  const variation = theme.cachedVariations![0]
  return {
    script,
    variation,
    brandColor,
    brandSecondaryColor: brandSecondaryColor ?? brandColor,
    logoUrl,
    businessName: 'Harmonia Dental',
    industry: 'dental',
    websiteUrl: null,
    gbpPhotos,
  }
}

export function MockupClient({ themes, brandColor, brandSecondaryColor, logoUrl, gbpPhotos }: Props) {
  if (themes.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <p style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>
          No cached reels found. Build a reel first, then revisit this page.
        </p>
      </div>
    )
  }

  const firstTheme = themes[0]
  const secondTheme = themes[1] ?? null

  const firstInputProps = buildInputProps(firstTheme, brandColor, brandSecondaryColor, logoUrl, gbpPhotos)
  const secondInputProps = secondTheme
    ? buildInputProps(secondTheme, brandColor, brandSecondaryColor, logoUrl, gbpPhotos)
    : null

  const firstTotalFrames = Math.round(firstTheme.cachedScript!.totalDuration * REEL_FPS)
  const secondTotalFrames = secondTheme
    ? Math.round(secondTheme.cachedScript!.totalDuration * REEL_FPS)
    : 0

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        padding: '48px 32px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: '#ffffff', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Effects Mockup
        </h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '8px 0 0' }}>
          Side-by-side comparison: original vs noise particles + transitions
        </p>
      </div>

      {/* Side-by-side comparison — first theme */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
          Theme 1: {firstTheme.title}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 32,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          marginBottom: 64,
        }}
      >
        {/* Left: Current */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              color: '#9ca3af',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid #374151',
              background: '#111827',
            }}
          >
            Current
          </span>
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            <Player
              component={ReelComposition as never}
              inputProps={firstInputProps}
              durationInFrames={firstTotalFrames}
              compositionWidth={REEL_WIDTH}
              compositionHeight={REEL_HEIGHT}
              fps={REEL_FPS}
              style={{ width: PLAYER_W, height: PLAYER_H }}
              controls
              loop
              autoPlay
            />
          </div>
        </div>

        {/* Right: With Noise + Transitions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              color: brandColor,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 20,
              border: `1px solid ${brandColor}50`,
              background: `${brandColor}15`,
            }}
          >
            With Noise + Transitions
          </span>
          <div
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${brandColor}30`,
            }}
          >
            <Player
              component={ReelCompositionV2 as never}
              inputProps={firstInputProps}
              durationInFrames={firstTotalFrames}
              compositionWidth={REEL_WIDTH}
              compositionHeight={REEL_HEIGHT}
              fps={REEL_FPS}
              style={{ width: PLAYER_W, height: PLAYER_H }}
              controls
              loop
              autoPlay
              errorFallback={({ error }: { error: Error }) => (
                <div style={{ padding: 16, color: '#f87171', fontSize: 12, background: '#1a0a0a', height: '100%', overflow: 'auto', wordBreak: 'break-word' }}>
                  <strong>V2 Error:</strong><br />{error.message}<br /><br /><span style={{ opacity: 0.6 }}>{error.stack?.slice(0, 400)}</span>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Second theme — V2 only, full width treatment */}
      {secondTheme && secondInputProps ? (
        <div>
          <div
            style={{
              height: 1,
              background: '#1f2937',
              marginBottom: 48,
            }}
          />
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Theme 2: {secondTheme.title}
            </p>
            <p style={{ color: '#4b5563', fontSize: 12, margin: 0 }}>
              Shown with noise + transitions
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <span
                style={{
                  color: brandColor,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: `1px solid ${brandColor}50`,
                  background: `${brandColor}15`,
                }}
              >
                With Noise + Transitions
              </span>
              <div
                style={{
                  borderRadius: 28,
                  overflow: 'hidden',
                  boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${brandColor}25`,
                }}
              >
                <Player
                  component={ReelCompositionV2 as never}
                  inputProps={secondInputProps}
                  durationInFrames={secondTotalFrames}
                  compositionWidth={REEL_WIDTH}
                  compositionHeight={REEL_HEIGHT}
                  fps={REEL_FPS}
                  style={{ width: 400, height: Math.round(400 * REEL_HEIGHT / REEL_WIDTH) }}
                  controls
                  loop
                  autoPlay
                />
              </div>
            </div>
          </div>
        </div>
      ) : themes.length < 2 ? (
        <p style={{ color: '#4b5563', fontSize: 13, marginTop: 8 }}>
          Only 1 cached theme available. Build another reel to see a second comparison.
        </p>
      ) : null}
    </div>
  )
}
